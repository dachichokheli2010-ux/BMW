// One policy feeds lesson previews and the completion reducer. Existing award
// records are never recalculated when these values change.
export const REWARD_POLICY = Object.freeze({lesson:20,perfect:15,daily:25,firstLesson:30,unit:100,checkpoint:50,advanced:25,review:10});
export const FIRST_LESSON_AWARD = 'milestone:first-lesson';
export const CREDIT_POLICY = Object.freeze({version:2,minimumAccuracy:80,lesson:2,perfect:3,checkpoint:4,daily:1,review:0});

// Credits recognize mastery on the first completed run. XP still recognizes
// learning after mistakes; neither a timer nor repeated clicks earns credits.
export function creditReward(lesson,{kind='lesson',accuracy=100}={}){
  if(!Number.isFinite(accuracy)||accuracy<CREDIT_POLICY.minimumAccuracy)return 0;
  if(kind==='review')return CREDIT_POLICY.review;
  if(kind==='daily')return CREDIT_POLICY.daily;
  return lesson?.boss?CREDIT_POLICY.checkpoint:accuracy===100?CREDIT_POLICY.perfect:CREDIT_POLICY.lesson;
}

export function lessonReward(lesson,kind='lesson'){
  return kind==='daily'?REWARD_POLICY.daily:kind==='review'?REWARD_POLICY.review:lesson?.boss?REWARD_POLICY.checkpoint:lesson?.advanced?REWARD_POLICY.advanced:REWARD_POLICY.lesson;
}
export function rewardPreview(lesson,{kind='lesson',perfect=false,firstLesson=false}={}){
  return lessonReward(lesson,kind)+(kind==='lesson'&&perfect?REWARD_POLICY.perfect:0)+(kind==='lesson'&&firstLesson?REWARD_POLICY.firstLesson:0);
}
