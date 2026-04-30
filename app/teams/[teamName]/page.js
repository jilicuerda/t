// app/teams/[teamName]/page.js
import { supabase } from '../../../utils/supabase'
import Link from 'next/link'

export default async function TeamPage({ params }) {
  // Decode the URL (changes %20 back to spaces if team names have spaces)
  const teamName = decodeURIComponent(params.teamName)

  // 1. Fetch the team details based on the URL name
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', teamName) // Case-insensitive match
    .single()

  if (error || !team) {
    return <div className="text-center p-10 text-2xl">Team not found</div>
  }

  // 2. Fetch the players belonging to this team
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', team.id)

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <Link href="/" className="text-gray-400 hover:text-white mb-8 block text-left">
        &larr; Back to Hub
      </Link>

      <div className="flex flex-col items-center mb-12">
        {team.logo_url && (
          <img src={team.logo_url} alt={team.name} className="w-48 h-48 rounded-lg object-cover mb-6 border-4 border-gray-800" />
        )}
        <h1 className="text-5xl font-extrabold tracking-tight">{team.name}</h1>
      </div>

      <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-left">Active Roster</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players?.length > 0 ? players.map(player => (
          <div key={player.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-left">
            <h3 className="text-xl font-bold text-red-400">{player.riot_id}</h3>
            <p className="text-gray-400 mt-1 uppercase tracking-widest text-sm">{player.role || 'Player'}</p>
          </div>
        )) : (
          <p className="text-gray-500">No players registered yet.</p>
        )}
      </div>
    </div>
  )
}