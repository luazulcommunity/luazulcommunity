import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não foram configuradas no ambiente da Vercel.");
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const allowedRoles = ["luazul", "influencer", "associado"] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({
      error: "Configuração do Supabase ausente. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    });
  }

  const { email, password, fullName, role } = req.body || {};

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({
      error: "Campos obrigatórios: email, password, fullName, role"
    });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      error: "Role inválida. Utilize luazul, influencer ou associado."
    });
  }

  try {
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_type: role
      }
    });

    if (createError) {
      throw createError;
    }

    const userId = userData.user?.id;

    if (!userId) {
      throw new Error("Não foi possível recuperar o ID do usuário criado.");
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert([{ user_id: userId, role }]);

    if (roleError && roleError.code !== "23505") { // ignore conflict
      throw roleError;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        email
      });

    if (profileError) {
      throw profileError;
    }

    return res.status(200).json({
      success: true,
      userId
    });
  } catch (error: any) {
    console.error("[create-portal-user] erro", error);
    return res.status(400).json({
      error: error?.message || "Não foi possível criar o usuário."
    });
  }
}

