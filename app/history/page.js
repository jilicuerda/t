// app/history/page.js
import { supabase } from '../../utils/supabase'

export default async function History() {
  // Fetch completed matches and join the team data directly in the query
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      team_a_score,
      team_b_score,
      match_date,
      team_a:teams!team_a_id (name, logo_url),
      team_b:teams!team_b_id (name, logo_url)
    `)
    .eq('status', 'completed')
    .order('match_date', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Match History</h1>

      <div className="flex flex-col gap-4">
        {matches?.map((match) => {
          // Determine the winner for styling purposes
          const teamAWon = match.team_a_score > match.team_b_score
          const teamBWon = match.team_b_score > match.team_a_score

          return (
            <div key={match.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6 flex justify-between items-center">
              
              {/* Team A Side */}
              <div className={`flex items-center gap-4 w-1/3 ${teamAWon ? 'text-white' : 'text-gray-500'}`}>
                <span className="font-bold text-lg hidden sm:block truncate">{match.team_a?.name}</span>
                <span className="text-3xl font-black ml-auto">{match.team_a_score}</span>
              </div>

              {/* Center Divider */}
              <div className="text-gray-600 font-mono text-sm px-4">VS</div>

              {/* Team B Side */}
              <div className={`flex items-center gap-4 w-1/3 flex-row-reverse ${teamBWon ? 'text-white' : 'text-gray-500'}`}>
                <span className="font-bold text-lg hidden sm:block truncate">{match.team_b?.name}</span>
                <span className="text-3xl font-black mr-auto">{match.team_b_score}</span>
              </div>

            </div>
          )
        })}

        {(!matches || matches.length === 0) && (
          <div className="text-center text-gray-500 py-10">
            No matches have been completed yet.
          </div>
        )}
      </div>
    </div>
  )
}