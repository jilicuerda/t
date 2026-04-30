// 1. Configuration (Replace these strings with your actual keys from Supabase)
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// 2. Initialize the Supabase connection globally
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// ADMIN DASHBOARD LOGIC
// ==========================================

async function initAdmin() {
    // Populate the dropdown menus immediately when the page loads
    await loadTeamsIntoSelects();

    // --- FORM 1: CREATE TEAM ---
    document.getElementById('team-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('team-status');
        showMessage(status, 'Uploading logo and creating team...', 'text-yellow-400');

        const name = document.getElementById('team-name').value;
        const fileInput = document.getElementById('team-logo');
        const file = fileInput.files[0];
        
        try {
            // 1. Generate a unique filename and upload the image to the 'team-logos' bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('team-logos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Ask Supabase for the permanent public URL of that uploaded image
            const { data: publicUrlData } = supabase.storage
                .from('team-logos')
                .getPublicUrl(fileName);
                
            const logoUrl = publicUrlData.publicUrl;

            // 3. Save the team name and the image URL into the database
            const { error: dbError } = await supabase
                .from('teams')
                .insert([{ name: name, logo_url: logoUrl }]);

            if (dbError) throw dbError;

            showMessage(status, 'Team created successfully!', 'text-green-400');
            document.getElementById('team-form').reset();
            
            // Refresh the dropdowns so the new team is immediately available to select
            await loadTeamsIntoSelects(); 
            
        } catch (err) {
            showMessage(status, `Error: ${err.message}`, 'text-red-500');
        }
    });

    // --- FORM 2: ADD PLAYER ---
    document.getElementById('player-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('player-status');
        
        const teamId = document.getElementById('player-team').value;
        const riotId = document.getElementById('player-riot-id').value;
        const role = document.getElementById('player-role').value;

        try {
            const { error } = await supabase
                .from('players')
                .insert([{ team_id: teamId, riot_id: riotId, role: role }]);

            if (error) throw error;

            showMessage(status, 'Player successfully added to roster!', 'text-green-400');
            document.getElementById('player-form').reset();
            
        } catch (err) {
            showMessage(status, `Error: ${err.message}`, 'text-red-500');
        }
    });

    // --- FORM 3: LOG MATCH ---
    document.getElementById('match-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('match-status');
        
        const teamA = document.getElementById('match-team-a').value;
        const teamB = document.getElementById('match-team-b').value;
        const scoreA = parseInt(document.getElementById('match-score-a').value);
        const scoreB = parseInt(document.getElementById('match-score-b').value);

        if (teamA === teamB) {
            showMessage(status, 'A team cannot play against itself!', 'text-red-500');
            return;
        }

        try {
            const { error } = await supabase
                .from('matches')
                .insert([{ 
                    team_a_id: teamA, 
                    team_b_id: teamB, 
                    team_a_score: scoreA, 
                    team_b_score: scoreB,
                    status: 'completed',
                    match_date: new Date().toISOString()
                }]);

            if (error) throw error;

            showMessage(status, 'Match officially recorded!', 'text-green-400');
            document.getElementById('match-form').reset();
            
        } catch (err) {
            showMessage(status, `Error: ${err.message}`, 'text-red-500');
        }
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Fetches all teams from the database and inserts them into the HTML <select> tags
async function loadTeamsIntoSelects() {
    // The IDs of the three dropdown menus in our HTML
    const selectIds = ['player-team', 'match-team-a', 'match-team-b'];
    
    // Safety check: ensure we are actually on the admin page
    if (!document.getElementById(selectIds[0])) return;

    const { data: teams, error } = await supabase.from('teams').select('*').order('name');
    
    if (error) {
        console.error("Could not load teams from database:", error.message);
        return;
    }

    // Loop through each dropdown and populate it
    selectIds.forEach(selectId => {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '<option value="">Select Team...</option>'; // Clear existing options
        
        teams.forEach(team => {
            selectElement.innerHTML += `<option value="${team.id}">${team.name}</option>`;
        });
    });
}

// Briefly displays success or error messages under the forms
function showMessage(element, text, colorClass) {
    element.textContent = text;
    // Reset classes and apply the requested color
    element.className = `mt-3 text-sm font-bold ${colorClass}`;
    element.classList.remove('hidden');
    
    // Hide the message again after 4 seconds
    setTimeout(() => {
        element.classList.add('hidden');
    }, 4000);
}