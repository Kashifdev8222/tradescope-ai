-- Phase 11: KYC Documents

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('id_front','id_back','passport','utility_bill','bank_statement','source_of_funds','selfie','other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kyc_user ON public.kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_documents(status);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY kyc_select_own ON public.kyc_documents FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY kyc_insert_own ON public.kyc_documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY kyc_update_admin ON public.kyc_documents FOR UPDATE USING (public.is_admin());
ALTER TABLE public.kyc_documents ADD COLUMN IF NOT EXISTS file_data TEXT;
