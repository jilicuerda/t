// app/page.js
import { supabase } from '../utils/supabase'
import Link from 'next/link'

// Next.js Server Component
export default async function Home() {
  // 1. Fetch all teams
  const { data: teams } = await supabase.from('teams').select('*')

  // 2. Fetch all completed matches to calculate the leaderboard
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'completed')

  // 3. Calculate Leaderboard Stats
  const leaderboard = teams?.map(team => {
    let wins = 0
    let losses = 0
    let roundsWon = 0
    let roundsLost = 0

    matches?.forEach(match => {
      if (match.team_a_id === team.id) {
        roundsWon += match.team_a_score
        roundsLost += match.team_b_score
        if (match.team_a_score > match.team_b_score) wins++
        if (match.team_a_score < match.team_b_score) losses++
      } else if (match.team_b_id === team.id) {
        roundsWon += match.team_b_score
        roundsLost += match.team_a_score
        if (match.team_b_score > match.team_a_score) wins++
        if (match.team_b_score < match.team_a_score) losses++
      }
    })

    return {
      ...team,
      wins,
      losses,
      differential: roundsWon - roundsLost
    }
  }).sort((a, b) => b.wins - a.wins || b.differential - a.differential) || []

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Valorant Tournament Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEADERBOARD SECTION */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">League Standings</h2>
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-left text-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4">Team</th>
                  <th className="p-4 text-center">W - L</th>
                  <th className="p-4 text-center">Round Diff</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((team, index) => (
                  <tr key={team.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="p-4 flex items-center gap-3">
                      <span className="text-gray-500 font-bold w-4">{index + 1}.</span>
                      <Link href={`/teams/${team.name}`} className="font-semibold hover:text-red-400 transition">
                        {team.name}
                      </Link>
                    </td>
                    <td className="p-4 text-center font-mono">{team.wins} - {team.losses}</td>
                    <td className="p-4 text-center font-mono">{team.differential > 0 ? `+${team.differential}` : team.differential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TEAMS LIST SECTION */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Participating Teams</h2>
          <div className="grid grid-cols-2 gap-4">
            {teams?.map(team => (
              <Link 
                href={`/teams/${team.name}`} 
                key={team.id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Logo</span>
                  )}
                </div>
                <span className="font-bold">{team.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}