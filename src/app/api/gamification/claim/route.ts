import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { missionId } = await request.json();
    
    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID required' }, { status: 400 });
    }
    
    const { data: mission, error: fetchError } = await supabase
      .from('weekly_missions')
      .select('*')
      .eq('id', missionId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }
    
    if (!mission.completed) {
      return NextResponse.json({ error: 'Mission not completed yet' }, { status: 400 });
    }
    
    if (mission.claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }
    
    const { error: updateError } = await supabase
      .from('weekly_missions')
      .update({ claimed: true })
      .eq('id', missionId);
    
    if (updateError) {
      console.error('Error claiming mission:', updateError);
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
    }
    
    const { error: karmaError } = await supabase.rpc('update_karma', {
      p_user_id: user.id,
      p_amount: mission.karma_reward,
      p_reason: `Missão semanal: ${mission.mission_type}`,
    });
    
    if (karmaError) {
      const { error: directError } = await supabase
        .from('profiles')
        .update({ 
          karma: (await supabase.from('profiles').select('karma').eq('id', user.id).single()).data?.karma + mission.karma_reward 
        })
        .eq('id', user.id);
      
      if (directError) {
        console.error('Error updating karma:', directError);
      }
      
      await supabase.from('karma_transactions').insert({
        user_id: user.id,
        amount: mission.karma_reward,
        reason: `Missão semanal: ${mission.mission_type}`,
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      karma_earned: mission.karma_reward,
      mission_type: mission.mission_type,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
