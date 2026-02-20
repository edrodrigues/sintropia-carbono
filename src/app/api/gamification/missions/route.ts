import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeekStart, MISSION_TYPES } from '@/lib/missions';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const weekStart = getWeekStart();
    
    let { data: missions, error } = await supabase
      .from('weekly_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart);
    
    if (error) {
      console.error('Error fetching missions:', error);
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }
    
    if (!missions || missions.length === 0) {
      const newMissions = MISSION_TYPES.map(m => ({
        user_id: user.id,
        mission_type: m.type,
        target: m.target,
        karma_reward: m.karma_reward,
        week_start: weekStart,
      }));
      
      const { error: insertError } = await supabase
        .from('weekly_missions')
        .insert(newMissions);
      
      if (insertError && insertError.code !== '23505') {
        console.error('Error creating missions:', insertError);
        return NextResponse.json({ error: 'Failed to create missions' }, { status: 500 });
      }
      
      const { data: newMissionData } = await supabase
        .from('weekly_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart);
      
      missions = newMissionData || [];
    }
    
    return NextResponse.json({ missions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
