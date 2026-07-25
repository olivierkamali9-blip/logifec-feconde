import { supabase } from '../lib/supabase'

export async function genererIdEngin() {
  const { data } = await supabase
    .from('vehicules')
    .select('id_engin')
    .order('created_at', { ascending: false })
    .limit(1)

  let nextNum = 1
  if (data && data[0]?.id_engin) {
    const match = data[0].id_engin.match(/(\d+)$/)
    if (match) nextNum = parseInt(match[1], 10) + 1
  }
  return `VEH-FEC-${String(nextNum).padStart(3, '0')}`
}
