-- ============================================
-- EDGE FUNCTION STUBS & SETUP
-- Note: These are called from the Edge Functions
-- ============================================

-- Create table to log edge function executions
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  execution_id text UNIQUE,
  request_data jsonb,
  response_data jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('success', 'error', 'timeout')),
  execution_time_ms int,
  error_message text,
  executed_at timestamp with time zone DEFAULT now()
);

-- Create index for querying logs
CREATE INDEX idx_edge_function_logs_name ON public.edge_function_logs(function_name);
CREATE INDEX idx_edge_function_logs_executed ON public.edge_function_logs(executed_at);

-- Function to log edge function calls
CREATE OR REPLACE FUNCTION public.log_edge_function_call(
  p_function_name text,
  p_execution_id text,
  p_request_data jsonb,
  p_status text,
  p_execution_time_ms int DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.edge_function_logs (
    function_name, execution_id, request_data, status, execution_time_ms, error_message
  ) VALUES (
    p_function_name, p_execution_id, p_request_data, p_status, p_execution_time_ms, p_error_message
  )
  RETURNING row_to_json(edge_function_logs.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;