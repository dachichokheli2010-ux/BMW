// Lesson structure is separate from UI and reuses the documented catalog.
const copy = [
  ['What you’ll learn','რას ისწავლით','Чему вы научитесь'],
  ['Key terms','ძირითადი ტერმინები','Ключевые термины'],
  ['Advanced explanation','დამატებითი განმარტება','Подробное объяснение'],
  ['See it in a BMW','შეისწავლეთ BMW-ის მაგალითზე','На примере BMW'],
  ['These cars illustrate the topic. The diagram is simplified and does not describe exact component fitment.','ეს ავტომობილები თემის შესწავლაში დაგეხმარებათ. დიაგრამა გამარტივებულია და კომპონენტების ზუსტ თავსებადობას არ ასახავს.','Эти автомобили иллюстрируют тему. Схема упрощена и не подтверждает совместимость деталей.'],
  ['Recognize the main components.','ამოიცანით ძირითადი კომპონენტები.','Распознавать основные компоненты.'],
  ['Follow how energy or information moves through the system.','გაარკვიეთ, როგორ მოძრაობს ენერგია ან ინფორმაცია სისტემაში.','Проследить передачу энергии или информации в системе.'],
  ['Explain the idea in your own words.','ახსენით იდეა საკუთარი სიტყვებით.','Объяснить идею своими словами.'],
  ['Distinguish the model family from its generation.','განასხვავეთ მოდელის ოჯახი და თაობა.','Различать семейство модели и поколение.'],
  ['Use the car’s proportions, lights and grille as visual clues.','ავტომობილის ამოსაცნობად გამოიყენეთ პროპორციები, ფარები და რადიატორის ცხაური.','Использовать пропорции, фары и решётку как визуальные подсказки.'],
  ['Check the documented configuration before assuming an engine.','ძრავის შესახებ დასკვნამდე გადაამოწმეთ დოკუმენტირებული ვერსია.','Проверять документированную версию перед выводом о двигателе.'],
  ['Identify the component and its purpose.','ამოიცანით კომპონენტი და მისი დანიშნულება.','Определять компонент и его назначение.'],
  ['Connect the part to the system around it.','დააკავშირეთ ნაწილი შესაბამის სისტემასთან.','Связывать деталь с окружающей системой.'],
  ['Separate a possible symptom from a confirmed fault.','განასხვავეთ შესაძლო სიმპტომი და დადასტურებული გაუმართაობა.','Отличать возможный симптом от подтверждённой неисправности.'],
  ['Recognize the engine family and cylinder layout.','ამოიცანით ძრავის ოჯახი და ცილინდრების განლაგება.','Определять семейство двигателя и компоновку цилиндров.'],
  ['Find a documented BMW application.','იპოვეთ BMW-ის დოკუმენტირებული გამოყენების მაგალითი.','Находить документированное применение в BMW.'],
  ['Understand why the exact variant matters.','გაიგეთ, რატომ არის მნიშვნელოვანი ზუსტი მოდიფიკაცია.','Понимать, почему важна точная модификация.'],
  ['Read all the simulated evidence.','წაიკითხეთ სიმულაციის ყველა მინიშნება.','Изучить все данные учебного случая.'],
  ['Choose a conclusion supported by the clues.','აირჩიეთ დასკვნა, რომელსაც მინიშნებები ამყარებს.','Выбрать вывод, подтверждённый данными.'],
  ['Recognize what still needs checking.','გაარკვიეთ, რა საჭიროებს დამატებით შემოწმებას.','Определить, что ещё нужно проверить.'],
  ['Build a sequence or connection without a timer.','ააწყვეთ თანმიმდევრობა ან კავშირი დროის შეზღუდვის გარეშე.','Составить последовательность или связь без таймера.'],
  ['Review an explanation and correct your answer.','გადაიკითხეთ განმარტება და შეასწორეთ პასუხი.','Изучить объяснение и исправить ответ.'],
  ['Learn from your first attempt, then revisit the idea.','ისწავლეთ პირველი მცდელობიდან და დაუბრუნდით თემას.','Учиться на первой попытке и возвращаться к теме.'],
  ['No professional qualification is implied by a learning rank.','სასწავლო წოდება პროფესიულ კვალიფიკაციას არ ნიშნავს.','Учебный ранг не является профессиональной квалификацией.'],
  ['Resume your lesson','გააგრძელეთ გაკვეთილი','Продолжить урок'],
  ['Continue where you left off. Your checked answers and first-attempt score are preserved.','გააგრძელეთ იქიდან, სადაც შეჩერდით. შემოწმებული პასუხები და პირველი მცდელობის ქულა შენახულია.','Продолжите с места остановки. Проверенные ответы и результат первых попыток сохранены.'],
  ['Resume lesson','გაკვეთილის გაგრძელება','Продолжить урок'],
  ['Discard unfinished lesson','დაუსრულებელი გაკვეთილის გაუქმება','Сбросить незавершённый урок'],
  ['Saved learning path','შენახული სასწავლო გზა','Сохранённый учебный путь'],
  ['Unlock date unknown for older progress.','ძველი პროგრესისთვის გახსნის თარიღი უცნობია.','Дата открытия для старого прогресса неизвестна.'],
  ['Longest streak','ყველაზე ხანგრძლივი სერია','Лучшая серия'],
  ['Last learning day','ბოლო სასწავლო დღე','Последний день обучения'],
  ['Unlocked on {day}','გაიხსნა: {day}','Открыто: {day}'],
  ['Your browser’s time zone: {zone}','თქვენი ბრაუზერის დროის სარტყელი: {zone}','Часовой пояс браузера: {zone}'],
  ['First lesson bonus','პირველი გაკვეთილის ბონუსი','Бонус за первый урок'],
  ['Perfect quiz bonus','სრულყოფილი ტესტის ბონუსი','Бонус за идеальный тест'],
  ['Completion reward','დასრულების ჯილდო','Награда за прохождение'],
  ['Finish a question before using Continue.','გაგრძელებამდე დაასრულეთ კითხვა.','Завершите вопрос перед продолжением.'],
  ['Distinguish power, torque and engine speed.','განასხვავეთ სიმძლავრე, მაბრუნებელი მომენტი და ძრავის ბრუნვის სიხშირე.','Различать мощность, крутящий момент и частоту вращения двигателя.'],
  ['Keep units attached to every value.','ყოველ მნიშვნელობას მიუთითეთ შესაბამისი საზომი ერთეული.','Указывать единицы измерения для каждого значения.'],
  ['Use the worked example to check your reasoning.','მსჯელობის შესამოწმებლად გამოიყენეთ განხილული მაგალითი.','Проверять свои рассуждения на разобранном примере.'],
];
export const teachingTranslations=copy;
const objectives={
  models:[copy[8][0],copy[9][0],copy[10][0]],parts:[copy[11][0],copy[12][0],copy[13][0]],
  engines:[copy[14][0],copy[15][0],copy[16][0]],mechanic:[copy[17][0],copy[18][0],copy[19][0]],
  practice:[copy[20][0],copy[21][0],copy[22][0]],default:[copy[5][0],copy[6][0],copy[7][0]]
};
const terms={
  'first-engine':['crankshaft','connecting-rod','torque'],combustion:['crankshaft','connecting-rod','camshaft'],transmission:['torque','dct','differential'],horsepower:['horsepower','torque'],torque:['torque','differential'],rpm:['rpm','crankshaft'],charging:['ecu'],differential:['differential','m-differential','xdrive'],turbocharging:['wastegate','intercooler','boost'],cooling:['intercooler'],electronics:['ecu'],electrification:['torque'], 'engine-codes':['vanos','valvetronic','ecu'],'drivetrain-layouts':['xdrive','differential','m-differential'],'m-performance':['m-differential','turbocharger','xdrive']
};
export function lessonTeaching(lesson,catalog){
  const family=lesson.id.startsWith('engine-')?lesson.id.slice(7).toUpperCase():null;
  const matches=lesson.modelId?catalog.filter(model=>model.id===lesson.modelId):family&&family!=='CODES'?catalog.filter(model=>model.code===family||model.code.startsWith(family+'TU')):['turbocharging','part-turbocharger'].includes(lesson.id)?catalog.filter(model=>model.code==='B58'):lesson.id==='electrification'?catalog.filter(model=>model.code==='eDrive'):['drivetrain-layouts','m-performance'].includes(lesson.id)?catalog.filter(model=>['f10-m5','g80-m3-cs'].includes(model.id)):lesson.topic==='parts'||['combustion','first-engine','horsepower','torque','transmission','cooling','engine-codes'].includes(lesson.id)?catalog.filter(model=>['f10-m5','e92'].includes(model.id)):[];
  return {objectives:['horsepower','torque','rpm'].includes(lesson.id)?copy.slice(-3).map(row=>row[0]):objectives[lesson.topic]||objectives.default,terms:terms[lesson.id]||(family?['vanos','ecu']:[]),examples:matches.filter(model=>model.source).slice(0,2)};
}
