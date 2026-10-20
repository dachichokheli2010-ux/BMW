import {t,registerTranslations,getLanguage} from './preferences.js';

export const challengeTranslations=[
  ['MASTERY ROUND','ცოდნის შემოწმება','ПРОВЕРКА ЗНАНИЙ'],
  ['Earn it through understanding.','მოიპოვე ცოდნით.','Зарабатывай знаниями.'],
  ['Five questions. Four correct to earn {reward} credits.','ხუთი კითხვა. {reward} კრედიტისთვის ოთხი სწორი პასუხია საჭირო.','Пять вопросов. Четыре верных ответа приносят {reward} кредита.'],
  ['Up to {credits} credits and {attempts} attempts per UTC day. A started round uses one attempt, even if it expires.','UTC დღის განმავლობაში მაქსიმუმ {credits} კრედიტი და {attempts} მცდელობა. დაწყებული რაუნდი ერთ მცდელობას ხარჯავს, ვადის გასვლის შემთხვევაშიც.','За сутки UTC: до {credits} кредитов и {attempts} попыток. Начатый раунд расходует попытку, даже если время истечёт.'],
  ['{remaining} attempts left today','დღეს დარჩენილია {remaining} მცდელობა','Сегодня осталось попыток: {remaining}'],
  ['You have up to 15 minutes. Rounds close at 00:00 UTC. Returning resumes the same round.','მაქსიმუმ 15 წუთი გაქვს. რაუნდები იხურება 00:00 UTC-ზე. დაბრუნებისას იგივე რაუნდი გაგრძელდება.','До 15 минут на раунд. Все раунды закрываются в 00:00 UTC. При возвращении продолжается тот же раунд.'],
  ['Start mastery round','დაიწყე ცოდნის შემოწმება','Начать проверку'],
  ['Today’s rounds are complete.','დღევანდელი რაუნდები დასრულებულია.','На сегодня раунды завершены.'],
  ['Question {current} of {total}','კითხვა {current} / {total}','Вопрос {current} из {total}'],
  ['Submit before {time}. Answers appear after the whole round.','გაგზავნე {time}-მდე. სწორი პასუხები მთელი რაუნდის შემდეგ გამოჩნდება.','Отправь до {time}. Ответы появятся после всего раунда.'],
  ['Previous question','წინა კითხვა','Предыдущий вопрос'],
  ['Next question','შემდეგი კითხვა','Следующий вопрос'],
  ['Review answers','პასუხების გადახედვა','Проверить выбранное'],
  ['Ready to submit?','მზად ხარ გასაგზავნად?','Готово к отправке?'],
  ['You can change any answer before submitting.','გაგზავნამდე ნებისმიერი პასუხის შეცვლა შეგიძლია.','Перед отправкой можно изменить любой ответ.'],
  ['Change answer {number}','შეცვალე პასუხი {number}','Изменить ответ {number}'],
  ['Submit all five answers','გაგზავნე ხუთივე პასუხი','Отправить все пять ответов'],
  ['Choose an answer to continue.','გასაგრძელებლად აირჩიე პასუხი.','Выбери ответ для продолжения.'],
  ['{score}/{total} correct · +{credits} credits','{score}/{total} სწორია · +{credits} კრედიტი','Верно: {score}/{total} · +{credits} кредита'],
  ['Round passed.','რაუნდი გავლილია.','Раунд пройден.'],
  ['Study the explanations, then try again.','გაეცანი განმარტებებს და სცადე ხელახლა.','Изучи объяснения и попробуй снова.'],
  ['Your answer: {answer}','შენი პასუხი: {answer}','Твой ответ: {answer}'],
  ['Correct answer: {answer}','სწორი პასუხი: {answer}','Правильный ответ: {answer}'],
  ['Read the source','წყაროს წაკითხვა','Читать источник'],
  ['Correct','სწორია','Верно'],
  ['Revisit','გაიმეორე','Повторить'],
];
registerTranslations(challengeTranslations);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const copy=(key,vars)=>esc(t(key,vars));
const control=(label,action,attrs='')=>`<button type="button" class="community-button ${action==='challenge-next'?'is-primary':''}" data-community-action="${action}" ${attrs}>${copy(label)}</button>`;

export function masteryMarkup({challenge,answers=[],step=0,result,credits={}}={}){
  const reached=Number(credits.earnedToday)>=Number(credits.dailyLimit)||Number(credits.attemptsRemaining)===0;
  const rules=`<div class="community-mastery-rules"><p>${copy('Five questions. Four correct to earn {reward} credits.',{reward:credits.reward??3})}</p><small>${copy('Up to {credits} credits and {attempts} attempts per UTC day. A started round uses one attempt, even if it expires.',{credits:credits.dailyCreditLimit??9,attempts:credits.attemptLimit??5})}</small><small>${copy('You have up to 15 minutes. Rounds close at 00:00 UTC. Returning resumes the same round.')}</small><span>${copy('{remaining} attempts left today',{remaining:credits.attemptsRemaining??5})}</span></div>`;
  if(challenge){
    const questions=challenge.questions||[],total=questions.length;
    const time=new Date(challenge.expiresAt).toLocaleTimeString(getLanguage(),{hour:'2-digit',minute:'2-digit'});
    const header=`<div class="community-mastery-head"><span class="community-kicker">${copy('MASTERY ROUND')}</span><strong>${copy('Question {current} of {total}',{current:Math.min(step+1,total),total})}</strong></div><progress max="${total}" value="${answers.filter(Number.isInteger).length}" aria-label="${copy('Review answers')}"></progress><p class="community-muted community-mastery-expiry">${copy('Submit before {time}. Answers appear after the whole round.',{time})}</p>`;
    if(step>=total)return `<form class="community-mastery" data-community-form="challenge">${header}<h3 data-challenge-focus tabindex="-1">${copy('Ready to submit?')}</h3><p>${copy('You can change any answer before submitting.')}</p><ol class="community-mastery-review">${questions.map((question,index)=>`<li><strong>${esc(question.prompt)}</strong><span>${esc(question.options[answers[index]])}</span><button type="button" class="community-text-link" data-community-action="challenge-edit" data-index="${index}">${copy('Change answer {number}',{number:index+1})}</button></li>`).join('')}</ol><div class="community-mastery-actions"><button class="community-button is-primary" type="submit" ${answers.length!==total||answers.some(answer=>!Number.isInteger(answer))?'disabled':''}>${copy('Submit all five answers')}</button></div></form>`;
    const question=questions[step];
    return `<div class="community-mastery">${header}<h3 data-challenge-focus tabindex="-1">${esc(question.prompt)}</h3><div class="community-mastery-options" role="radiogroup" aria-label="${esc(question.prompt)}">${question.options.map((option,index)=>`<label class="community-mastery-option ${answers[step]===index?'is-selected':''}"><input type="radio" name="mastery-answer" data-challenge-answer="${index}" value="${index}" ${answers[step]===index?'checked':''}><span class="community-mastery-letter" aria-hidden="true">${String.fromCharCode(65+index)}</span><span>${esc(option)}</span></label>`).join('')}</div><div class="community-mastery-actions">${step?control('Previous question','challenge-previous'):''}${control(step===total-1?'Review answers':'Next question','challenge-next',`${Number.isInteger(answers[step])?'':'disabled'}`)}</div></div>`;
  }
  const review=result?`<section class="community-mastery-result"><div class="community-mastery-score ${result.correct?'is-passed':''}"><strong>${copy('{score}/{total} correct · +{credits} credits',{score:result.score,total:result.total,credits:result.awarded})}</strong><p>${copy(result.correct?'Round passed.':'Study the explanations, then try again.')}</p></div><div class="community-mastery-feedback">${(result.results||[]).map((item,index)=>{const url=/^https:\/\//i.test(item.source?.url||'')?item.source.url:'';return `<details ${!item.correct?'open':''}><summary><span class="community-tag ${item.correct?'is-approved':''}">${copy(item.correct?'Correct':'Revisit')}</span> ${index+1}. ${esc(item.prompt)}</summary><p>${copy('Your answer: {answer}',{answer:item.options?.[item.selected]})}</p>${item.correct?'':`<p><strong>${copy('Correct answer: {answer}',{answer:item.options?.[item.answer]})}</strong></p>`}<p>${esc(item.explanation)}</p>${url?`<a class="community-text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${copy('Read the source')} ↗</a>`:''}</details>`;}).join('')}</div></section>`:'';
  return `${review}${rules}${control(reached?'Today’s rounds are complete.':'Start mastery round','challenge',reached?'disabled':'')}`;
}
