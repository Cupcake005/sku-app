import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan KEY punya Mas Viktorinus
const supabaseUrl = 'https://wmcqigpohivupwtnpoau.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtY3FpZ3BvaGl2dXB3dG5wb2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQ1MDMsImV4cCI6MjA4MzI1MDUwM30.MgQ36hCqDuyAj3IHkBkULe3kbQkzg71TyUgFkDk251o'

export const supabase = createClient(supabaseUrl, supabaseKey)