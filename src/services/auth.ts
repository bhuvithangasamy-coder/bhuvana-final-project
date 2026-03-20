export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export type AuthResponse = {
  message: string;
  user?: User;
  token?: string;
  recruiter?: {
    id: number;
    company_name: string;
    email: string;
    role: string;
  };
};

const BASE = "http://localhost:5000/api/auth";
const RECRUITER_BASE = "http://localhost:5000/api/recruiter";

export const createSession = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const payload = await res.json().catch(() => ({ message: "Invalid response" }));
  if (!res.ok) throw new Error(payload.message || "Login failed");

  return payload as AuthResponse;
};

export const getSession = async (): Promise<any> => {
  const res = await fetch(`${BASE}/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

export const registerRecruiter = async (company_name: string, email: string, password: string, phone_number: string): Promise<AuthResponse> => {
  const res = await fetch(`${RECRUITER_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_name, email, password, phone_number }),
  });

  const payload = await res.json().catch(() => ({ message: "Invalid response" }));
  if (!res.ok) throw new Error(payload.message || "Registration failed");

  // Format to match expected layout where possible
  return { ...payload, user: payload.recruiter ? { id: payload.recruiter.id, username: payload.recruiter.company_name, email: payload.recruiter.email, role: 'recruiter', created_at: new Date().toISOString() } : undefined } as AuthResponse;
};

export const loginRecruiter = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${RECRUITER_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await res.json().catch(() => ({ message: "Invalid response" }));
  if (!res.ok) throw new Error(payload.message || "Login failed");

  return { ...payload, user: payload.recruiter ? { id: payload.recruiter.id, username: payload.recruiter.company_name, email: payload.recruiter.email, role: 'recruiter', created_at: new Date().toISOString() } : undefined } as AuthResponse;
};

export default { createSession, getSession, registerRecruiter, loginRecruiter };
