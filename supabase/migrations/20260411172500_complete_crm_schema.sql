
-- 1. CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    propietario TEXT NOT NULL DEFAULT 'Sin nombre',
    placa TEXT,
    insurance TEXT,
    email TEXT,
    phone TEXT,
    state TEXT NOT NULL DEFAULT 'nuevo',
    monto NUMERIC DEFAULT 0,
    valor_prima NUMERIC DEFAULT 0,
    fecha TEXT,
    assigned_to TEXT,
    lugar TEXT,
    client_fields JSONB DEFAULT '{}'::jsonb,
    activities JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    phones JSONB DEFAULT '[]'::jsonb,
    emails JSONB DEFAULT '[]'::jsonb,
    score INTEGER DEFAULT 0,
    expiration_date TEXT,
    is_renewal BOOLEAN DEFAULT false,
    parent_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    opportunity_type TEXT,
    comision_calculada NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist (in case table was created partially)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='score') THEN
        ALTER TABLE public.crm_leads ADD COLUMN score INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='expiration_date') THEN
        ALTER TABLE public.crm_leads ADD COLUMN expiration_date TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='is_renewal') THEN
        ALTER TABLE public.crm_leads ADD COLUMN is_renewal BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='parent_lead_id') THEN
        ALTER TABLE public.crm_leads ADD COLUMN parent_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='opportunity_type') THEN
        ALTER TABLE public.crm_leads ADD COLUMN opportunity_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_leads' AND column_name='comision_calculada') THEN
        ALTER TABLE public.crm_leads ADD COLUMN comision_calculada NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user TEXT NOT NULL,
    to_user TEXT,
    text TEXT NOT NULL,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    lead_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CRM ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.crm_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    lead_name TEXT,
    created_by TEXT,
    dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CRM CONFIG TABLE (Global Persistence)
CREATE TABLE IF NOT EXISTS public.crm_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SET UP RLS POLICIES

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_config ENABLE ROW LEVEL SECURITY;

-- Leads Policies
CREATE POLICY "Users can view assigned or unassigned leads" ON public.crm_leads
    FOR SELECT TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        user_id = auth.uid() OR 
        assigned_to IS NULL OR 
        assigned_to = (SELECT display_name FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert leads" ON public.crm_leads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their leads" ON public.crm_leads
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can delete leads" ON public.crm_leads
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Chat Policies
CREATE POLICY "Authenticated users can view chat" ON public.chat_messages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
    FOR INSERT TO authenticated WITH CHECK (true);

-- Alerts Policies
CREATE POLICY "Users can view their alerts" ON public.crm_alerts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their alerts" ON public.crm_alerts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Config Policies
CREATE POLICY "Authenticated users can view config" ON public.crm_config
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update config" ON public.crm_config
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- AUTO UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE TRIGGER update_crm_leads_updated_at
    BEFORE UPDATE ON public.crm_leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crm_config_updated_at
    BEFORE UPDATE ON public.crm_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
