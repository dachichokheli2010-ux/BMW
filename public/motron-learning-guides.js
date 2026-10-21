// Motron coaching adds a question to think through before graded practice.
// Facts and examples restate the linked sources already attached to each lesson.
// English is the translation key; register these rows with preferences.js.
// These records never change lesson IDs, question IDs, progress or rewards.
export const learningGuideTranslations = [];
const text = (en, ka, ru) => (learningGuideTranslations.push([en, ka, ru]), en);

const tracks = {
  basics: {
    eyebrow: text('START WITH THE MACHINE', 'დაიწყე მანქანის მუშაობით', 'НАЧНИТЕ С УСТРОЙСТВА'),
    title: text('From a piston to the road', 'დგუშიდან გზამდე', 'От поршня до дороги'),
    promise: text('Build a clear picture of how an engine makes motion and how the car uses it.', 'შექმენი ნათელი წარმოდგენა, როგორ ქმნის ძრავა მოძრაობას და როგორ იყენებს მას მანქანა.', 'Разберитесь, как двигатель создаёт движение и как автомобиль его использует.'),
    outcome: text('You can trace the drive path and explain power, torque and RPM without mixing them up.', 'შეძლებ ამძრავის გზის ახსნას და სიმძლავრის, მომენტისა და RPM-ის ერთმანეთისგან გარჩევას.', 'Вы сможете проследить передачу тяги и различать мощность, момент и RPM.'),
    focus: [
      text('Follow energy into rotation.', 'მიჰყევი ენერგიის ბრუნვად გარდაქმნას.', 'Проследите превращение энергии во вращение.'),
      text('Read a number together with its unit.', 'რიცხვი მის საზომ ერთეულთან ერთად წაიკითხე.', 'Читайте число вместе с единицей измерения.'),
      text('Connect air, cooling, charging and drive.', 'დააკავშირე ჰაერის, გაგრილების, დამუხტვისა და ამძრავის სისტემები.', 'Свяжите впуск, охлаждение, зарядку и привод.')
    ]
  },
  powertrains: {
    eyebrow: text('COMPARE THE POWER PATHS', 'შეადარე ენერგიის გზები', 'СРАВНИТЕ ПУТИ ЭНЕРГИИ'),
    title: text('One car, connected systems', 'ერთი მანქანა, დაკავშირებული სისტემები', 'Один автомобиль, связанные системы'),
    promise: text('Compare engine families, driven axles and electric drive using documented examples.', 'დოკუმენტირებულ მაგალითებზე შეადარე ძრავის ოჯახები, წამყვანი ღერძები და ელექტროამძრავი.', 'Сравните семейства двигателей, ведущие оси и электропривод на документированных примерах.'),
    outcome: text('You can describe a configuration and say which vehicle details still need checking.', 'შეძლებ კონფიგურაციის აღწერას და იმის თქმას, მანქანის რომელი მონაცემია კიდევ შესამოწმებელი.', 'Вы сможете описать конфигурацию и указать, какие сведения об автомобиле ещё нужно проверить.'),
    focus: [
      text('Separate an engine family from a specific variant.', 'გაარჩიე ძრავის ოჯახი და კონკრეტული მოდიფიკაცია.', 'Различайте семейство двигателя и конкретную модификацию.'),
      text('Follow drive to the relevant axle.', 'მიჰყევი ბრუნვის გადაცემას შესაბამის ღერძამდე.', 'Проследите передачу тяги к нужной оси.'),
      text('Compare propulsion with energy recovery.', 'შეადარე ამძრავის რეჟიმი და ენერგიის აღდგენა.', 'Сравните тягу и возврат энергии.')
    ]
  },
  parts: {
    eyebrow: text('LOOK INSIDE THE SYSTEM', 'შეიხედე სისტემაში', 'ЗАГЛЯНИТЕ В СИСТЕМУ'),
    title: text('Give every part a job', 'იპოვე თითოეული ნაწილის დანიშნულება', 'Найдите задачу каждой детали'),
    promise: text('Use real photographs, then connect each component to what enters it and what leaves it.', 'ნახე რეალური ფოტოები და დააკავშირე თითოეული კომპონენტი იმასთან, რაც მას მიეწოდება და მისგან გამოდის.', 'Изучите реальные фотографии и свяжите каждый компонент с тем, что в него поступает и что выходит.'),
    outcome: text('You can identify a component, explain its purpose and distinguish a symptom from a confirmed fault.', 'შეძლებ კომპონენტის ამოცნობას, მისი დანიშნულების ახსნას და სიმპტომის დადასტურებული დაზიანებისგან გარჩევას.', 'Вы сможете узнать компонент, объяснить его назначение и отличить симптом от подтверждённой неисправности.'),
    focus: [
      text('Look at the complete component.', 'დააკვირდი კომპონენტს მთლიანად.', 'Рассмотрите компонент целиком.'),
      text('Name its role and its connections.', 'დაასახელე მისი როლი და კავშირები.', 'Назовите его роль и связи.'),
      text('Ask what evidence a symptom provides.', 'იკითხე, რას ადასტურებს სიმპტომი.', 'Спросите, что именно подтверждает симптом.')
    ]
  },
  models: {
    eyebrow: text('LEARN TO NOTICE', 'ისწავლე დეტალების შემჩნევა', 'УЧИТЕСЬ ЗАМЕЧАТЬ'),
    title: text('Read the shape of an M car', 'ამოიცანი M მანქანის ფორმები', 'Узнайте M по облику'),
    promise: text('Build recognition from proportions, body shape, lights and grille, then check the documented generation.', 'ამოცნობისთვის შეადარე პროპორციები, ძარის ფორმა, ფარები და ცხაური, შემდეგ კი გადაამოწმე დოკუმენტირებული თაობა.', 'Сопоставьте пропорции, кузов, фары и решётку, затем проверьте документированное поколение.'),
    outcome: text('You can name the visual clues behind an answer and keep model identity separate from engine assumptions.', 'შეძლებ ახსნა, რომელმა ვიზუალურმა ნიშნებმა მიგიყვანა პასუხამდე, და მოდელის ამოცნობა ძრავაზე ვარაუდისგან გამიჯნო.', 'Вы сможете назвать визуальные признаки своего ответа и отделить узнавание модели от предположений о двигателе.'),
    focus: [
      text('Start with the body and proportions.', 'დაიწყე ძარითა და პროპორციებით.', 'Начните с кузова и пропорций.'),
      text('Use several visual clues together.', 'ერთდროულად რამდენიმე ვიზუალური ნიშანი გამოიყენე.', 'Сопоставляйте несколько внешних признаков.'),
      text('Check the exact model before naming its engine.', 'ძრავის დასახელებამდე ზუსტი მოდელი გადაამოწმე.', 'Перед определением двигателя уточните модель.')
    ]
  },
  engines: {
    eyebrow: text('READ THE ENGINE FAMILY', 'გაიცანი ძრავის ოჯახი', 'РАЗБЕРИТЕСЬ В СЕМЕЙСТВАХ'),
    title: text('A code with a context', 'კოდი თავის კონტექსტში', 'Код в своём контексте'),
    promise: text('Meet four documented engine families and connect each name to a layout and a real application.', 'გაიცანი ძრავის ოთხი დოკუმენტირებული ოჯახი და თითოეული სახელი განლაგებასა და რეალურ გამოყენებას დაუკავშირე.', 'Познакомьтесь с четырьмя документированными семействами и свяжите каждое с компоновкой и реальным применением.'),
    outcome: text('You can explain what a family code tells you and what needs an exact application reference.', 'შეძლებ ახსნა, რას გეუბნება ოჯახის კოდი და რისთვის გჭირდება ზუსტი გამოყენების წყარო.', 'Вы сможете объяснить, что сообщает код семейства и для чего нужна документация конкретного применения.'),
    focus: [
      text('Identify the cylinder arrangement.', 'ამოიცანი ცილინდრების განლაგება.', 'Определите расположение цилиндров.'),
      text('Attach the family to a documented model.', 'ძრავის ოჯახი დოკუმენტირებულ მოდელს დაუკავშირე.', 'Свяжите семейство с документированной моделью.'),
      text('Keep production details with the example.', 'მაგალითს წარმოების მონაცემებიც დაურთე.', 'Сохраняйте производственные данные примера.')
    ]
  },
  systems: {
    eyebrow: text('FOLLOW THE RESPONSE', 'მიჰყევი სისტემის რეაქციას', 'ПРОСЛЕДИТЕ ОТКЛИК'),
    title: text('What happens after an input?', 'რა ხდება ზემოქმედების შემდეგ?', 'Что происходит после воздействия?'),
    promise: text('Study how suspension handles movement and how electronics measure, decide and respond.', 'შეისწავლე, როგორ მართავს საკიდარი მოძრაობას და როგორ ზომავს, წყვეტს და რეაგირებს ელექტრონიკა.', 'Изучите, как подвеска работает с движением, а электроника измеряет, принимает решения и действует.'),
    outcome: text('You can trace a system response and identify the feedback needed to judge the result.', 'შეძლებ სისტემის რეაქციის თანმიმდევრულად აღწერას და შედეგის შესაფასებლად საჭირო უკუკავშირის დასახელებას.', 'Вы сможете проследить отклик системы и назвать обратную связь для оценки результата.'),
    focus: [
      text('Separate storing energy from dissipating it.', 'გაარჩიე ენერგიის შენახვა და გაფანტვა.', 'Различайте запасание и рассеивание энергии.'),
      text('Trace sense, compare, act and feedback.', 'მიჰყევი გაზომვას, შედარებას, მოქმედებასა და უკუკავშირს.', 'Проследите измерение, сравнение, действие и обратную связь.'),
      text('Check the result after the command.', 'ბრძანების შემდეგ შედეგი შეამოწმე.', 'Проверьте результат после команды.')
    ]
  },
  mechanic: {
    eyebrow: text('REASON FROM THE CLUES', 'იმსჯელე მინიშნებებით', 'РАССУЖДАЙТЕ ПО ДАННЫМ'),
    title: text('Evidence before a verdict', 'ჯერ მტკიცებულება, შემდეგ დასკვნა', 'Сначала данные, затем вывод'),
    promise: text('Work through short simulations by connecting every clue to the system you have studied.', 'მოკლე სიმულაციებში თითოეული მინიშნება შენ მიერ შესწავლილ სისტემას დაუკავშირე.', 'Пройдите короткие симуляции, связывая каждую подсказку с изученной системой.'),
    outcome: text('You can choose the supported conclusion and say what the exercise has not established.', 'შეძლებ მტკიცებულებით გამყარებული დასკვნის არჩევას და იმის თქმას, რაც სავარჯიშოს ჯერ არ დაუდასტურებია.', 'Вы сможете выбрать обоснованный вывод и указать, что задача ещё не доказала.'),
    focus: [
      text('Read every clue before choosing.', 'არჩევანამდე ყველა მინიშნება წაიკითხე.', 'Перед выбором прочитайте все данные.'),
      text('Notice evidence that challenges your first idea.', 'შეამჩნიე მტკიცებულება, რომელიც პირველ ვარაუდს ეწინააღმდეგება.', 'Замечайте данные, противоречащие первой версии.'),
      text('State what still needs checking.', 'დაასახელე, რა რჩება შესამოწმებელი.', 'Назовите то, что ещё нужно проверить.')
    ]
  }
};

const guides = {
  'first-engine': {
    hook: text('A piston moves up and down. The wheels turn. What connects those two motions?', 'დგუში ზემოთ და ქვემოთ მოძრაობს, თვლები კი ბრუნავს. რა აკავშირებს ამ ორ მოძრაობას?', 'Поршень движется вверх и вниз, а колёса вращаются. Что связывает эти движения?'),
    concept: text('Combustion pressure pushes the piston. The connecting rod carries that force to the crankshaft, producing rotation.', 'წვის წნევა დგუშს აწვება. ბარბაცა ამ ძალას მუხლა ლილვს გადასცემს და ბრუნვას ქმნის.', 'Давление сгорания толкает поршень. Шатун передаёт усилие коленвалу, создавая вращение.'),
    scenario: {
      prompt: text('Trace one push: pressure → piston → connecting rod → what rotating part? Then name the component that changes the ratio on the way to the wheels.', 'მიჰყევი ერთ ბიძგს: წნევა → დგუში → ბარბაცა → რომელი მბრუნავი ნაწილი? შემდეგ დაასახელე კომპონენტი, რომელიც თვლებისკენ გადაცემის შეფარდებას ცვლის.', 'Проследите один толчок: давление → поршень → шатун → какая вращающаяся деталь? Затем назовите узел, меняющий передаточное отношение на пути к колёсам.'),
      reasoning: text('The crankshaft delivers rotation. The transmission then changes the relationship between rotational speed and torque before drive reaches the wheels.', 'მუხლა ლილვი ბრუნვას იძლევა. შემდეგ გადაცემათა კოლოფი ბრუნვის სიხშირისა და მომენტის თანაფარდობას ცვლის, სანამ ბრუნვა თვლებამდე მივა.', 'Вращение создаёт коленвал. Затем коробка меняет соотношение оборотов и момента перед передачей тяги к колёсам.')
    },
    takeaways: [
      text('Say the conversion: pressure → movement → rotation.', 'თქვი გარდაქმნის გზა: წნევა → მოძრაობა → ბრუნვა.', 'Назовите преобразование: давление → движение → вращение.'),
      text('Separate making rotation from adapting it.', 'გაარჩიე ბრუნვის შექმნა და მისი გარდაქმნა.', 'Различайте создание вращения и изменение его параметров.')
    ]
  },
  transmission: {
    hook: text('A lower gear offers more turning effect at the output. What does it trade to get that?', 'დაბალი გადაცემა გამოსასვლელზე მეტ მაბრუნებელ ეფექტს იძლევა. რის ხარჯზე იღებს მას?', 'Понижающая передача даёт больший момент на выходе. Что она меняет ради этого?'),
    concept: text('A reduction trades output speed for torque. In the ideal example, the ratio multiplies torque and divides speed by the same factor.', 'რედუქცია გამოსასვლელ სიჩქარეს მომენტზე ცვლის. იდეალურ მაგალითში შეფარდება მომენტს ამრავლებს და სიჩქარეს იმავე რიცხვზე ყოფს.', 'Понижение обменивает выходные обороты на момент. В идеальном примере передаточное число умножает момент и во столько же раз уменьшает обороты.'),
    scenario: {
      prompt: text('A 3:1 reduction receives 3,000 RPM and 100 Nm. Predict both output values before opening the explanation. Ignore losses for this example.', '3:1 რედუქციას მიეწოდება 3 000 RPM და 100 Nm. განმარტების გახსნამდე ივარაუდე ორივე გამოსასვლელი მნიშვნელობა. ამ მაგალითში დანაკარგები გამორიცხე.', 'На понижение 3:1 поступает 3 000 RPM и 100 Nm. До объяснения определите обе выходные величины. В этом примере пренебрегаем потерями.'),
      reasoning: text('3,000 ÷ 3 = 1,000 RPM; 100 × 3 = 300 Nm. More torque comes with less speed. The ideal gearset has not created power.', '3 000 ÷ 3 = 1 000 RPM; 100 × 3 = 300 Nm. მეტი მომენტი ნაკლებ სიჩქარეს ახლავს. იდეალურ მექანიზმს სიმძლავრე არ შეუქმნია.', '3 000 ÷ 3 = 1 000 RPM; 100 × 3 = 300 Nm. Больший момент сопровождается меньшими оборотами. Идеальная передача не создала мощность.')
    },
    takeaways: [
      text('For reduction: divide speed, multiply ideal torque.', 'რედუქციისას: სიჩქარე გაყავი, იდეალური მომენტი გაამრავლე.', 'При понижении делите обороты и умножайте идеальный момент.'),
      text('State the ratio and whether losses are included.', 'მიუთითე შეფარდება და გათვალისწინებულია თუ არა დანაკარგები.', 'Указывайте передаточное число и учтены ли потери.')
    ]
  },
  horsepower: {
    hook: text('Two engines show the same torque. Is that enough to compare their power?', 'ორი ძრავა ერთნაირ მომენტს აჩვენებს. საკმარისია ეს მათი სიმძლავრის შესადარებლად?', 'Два двигателя показывают одинаковый момент. Хватит ли этого для сравнения мощности?'),
    concept: text('Power describes how quickly work happens. At a particular operating point, both torque and rotational speed matter.', 'სიმძლავრე გვიჩვენებს, რამდენად სწრაფად სრულდება მუშაობა. კონკრეტულ რეჟიმში მნიშვნელობა მომენტსაც აქვს და ბრუნვის სიხშირესაც.', 'Мощность описывает скорость выполнения работы. В конкретном режиме важны и момент, и обороты.'),
    scenario: {
      prompt: text('Engine A makes 200 Nm at 1,500 RPM. Engine B makes 200 Nm at 3,000 RPM. Which has more power at these points, and by what factor?', 'A ძრავა 1 500 RPM-ზე 200 Nm-ს იძლევა. B ძრავა 3 000 RPM-ზე 200 Nm-ს იძლევა. ამ რეჟიმებში რომელს აქვს მეტი სიმძლავრე და რამდენჯერ?', 'Двигатель A выдаёт 200 Nm при 1 500 RPM, а B — 200 Nm при 3 000 RPM. В этих точках у кого больше мощность и во сколько раз?'),
      reasoning: text('B has twice the power at the stated point: the same torque acts at twice the rotational speed. This comparison does not establish either engine’s peak power.', 'მითითებულ რეჟიმში B-ს ორჯერ მეტი სიმძლავრე აქვს: იგივე მომენტი ორმაგი ბრუნვის სიხშირით მოქმედებს. ეს შედარება არცერთი ძრავის პიკურ სიმძლავრეს არ ადგენს.', 'У B в указанной точке вдвое больше мощность: тот же момент при удвоенных оборотах. Это сравнение не определяет пиковую мощность двигателей.')
    },
    takeaways: [
      text('Ask for torque and RPM at the same operating point.', 'მოითხოვე მომენტი და RPM ერთი და იმავე რეჟიმისთვის.', 'Сопоставляйте момент и RPM одного режима.'),
      text('Keep kW, hp or PS attached to the quoted figure.', 'მოყვანილ რიცხვს kW, hp ან PS ერთეული შეუნარჩუნე.', 'Сохраняйте kW, hp или PS рядом с указанным числом.')
    ]
  },
  torque: {
    hook: text('Think of a wrench: why does the distance from the bolt matter as well as the push?', 'წარმოიდგინე გასაღები: ბიძგთან ერთად რატომ აქვს მნიშვნელობა ჭანჭიკიდან მანძილსაც?', 'Представьте ключ: почему кроме силы важно расстояние от болта?'),
    concept: text('Torque is a turning effect. For a perpendicular push, multiply force by the distance from the turning axis.', 'მომენტი მაბრუნებელი ეფექტია. მართობული ძალისას ძალა ბრუნვის ღერძიდან მანძილზე გაამრავლე.', 'Момент — вращающее действие силы. При перпендикулярном усилии умножьте силу на расстояние до оси вращения.'),
    scenario: {
      prompt: text('A diagram shows a 10 N perpendicular force applied 0.3 m from an axis. Find the torque. Then move the same force to 0.6 m and compare.', 'დიაგრამაზე 10 N მართობული ძალა ღერძიდან 0,3 მ-ზე მოქმედებს. იპოვე მომენტი. შემდეგ იგივე ძალა 0,6 მ-ზე გადაიტანე და შეადარე.', 'На схеме перпендикулярная сила 10 N приложена в 0,3 м от оси. Найдите момент. Затем перенесите ту же силу на 0,6 м и сравните.'),
      reasoning: text('10 × 0.3 = 3 Nm. At 0.6 m, 10 × 0.6 = 6 Nm. Doubling the perpendicular lever arm doubles the turning effect without changing the force.', '10 × 0,3 = 3 Nm. 0,6 მ-ზე: 10 × 0,6 = 6 Nm. მართობული მხრის გაორმაგება ძალის შეცვლის გარეშე მაბრუნებელ ეფექტს აორმაგებს.', '10 × 0,3 = 3 Nm. При 0,6 м: 10 × 0,6 = 6 Nm. Удвоение перпендикулярного плеча удваивает момент без изменения силы.')
    },
    takeaways: [
      text('Identify the force and the perpendicular lever arm.', 'დაადგინე ძალა და მართობული მხარი.', 'Определите силу и перпендикулярное плечо.'),
      text('Keep the result in Nm, separate from power units.', 'შედეგი Nm-ში გამოსახე და სიმძლავრის ერთეულებისგან გაარჩიე.', 'Записывайте результат в Nm и отличайте его от единиц мощности.')
    ]
  },
  rpm: {
    hook: text('A tachometer counts engine rotation. What can that reading tell you on its own?', 'ტაქომეტრი ძრავის ბრუნვას ითვლის. რას გეუბნება მხოლოდ ეს მაჩვენებელი?', 'Тахометр показывает обороты двигателя. О чём говорит одно это показание?'),
    concept: text('RPM counts revolutions in one minute. Road speed also depends on the gear, final drive and tire size.', 'RPM ერთ წუთში ბრუნების რაოდენობაა. გზის სიჩქარე გადაცემაზე, მთავარ გადაცემასა და საბურავის ზომაზეცაა დამოკიდებული.', 'RPM — число оборотов за минуту. Скорость автомобиля зависит также от передачи, главной передачи и размера шин.'),
    scenario: {
      prompt: text('The crankshaft holds 2,000 RPM for 30 seconds in a thought experiment. How many revolutions does it complete? Can this alone give the road speed?', 'წარმოსახვით მაგალითში მუხლა ლილვი 30 წამით ინარჩუნებს 2 000 RPM-ს. რამდენ ბრუნს ასრულებს? იძლევა მხოლოდ ეს გზის სიჩქარის დადგენის საშუალებას?', 'В мысленном примере коленвал держит 2 000 RPM в течение 30 секунд. Сколько оборотов он сделает? Можно ли только по этому узнать скорость автомобиля?'),
      reasoning: text('Thirty seconds is half a minute: 2,000 × 0.5 = 1,000 revolutions. Road speed remains unknown because the drivetrain ratios and tire size are not supplied.', 'ოცდაათი წამი ნახევარი წუთია: 2 000 × 0,5 = 1 000 ბრუნი. გზის სიჩქარე უცნობია, რადგან ამძრავის შეფარდებები და საბურავის ზომა მოცემული არ არის.', 'Тридцать секунд — полминуты: 2 000 × 0,5 = 1 000 оборотов. Скорость автомобиля неизвестна: передаточные числа и размер шин не заданы.')
    },
    takeaways: [
      text('Convert the time to minutes before counting revolutions.', 'ბრუნების დათვლამდე დრო წუთებში გადაიყვანე.', 'Перед подсчётом оборотов переведите время в минуты.'),
      text('Do not read RPM as road speed or power.', 'RPM გზის სიჩქარედ ან სიმძლავრედ არ წაიკითხო.', 'Не принимайте RPM за скорость автомобиля или мощность.')
    ]
  },
  turbocharging: {
    hook: text('A turbocharger connects exhaust energy to intake compression. Does that mean the two gas streams mix?', 'ტურბოკომპრესორი გამონაბოლქვის ენერგიას შემშვები ჰაერის შეკუმშვას უკავშირებს. ნიშნავს ეს ორი ნაკადის შერევას?', 'Турбокомпрессор связывает энергию выхлопа со сжатием впускного воздуха. Значит ли это, что потоки смешиваются?'),
    concept: text('The exhaust turns the turbine. A shared shaft drives the compressor, while exhaust and intake air stay on separate paths.', 'გამონაბოლქვი ტურბინას ატრიალებს. საერთო ლილვი კომპრესორს ამოძრავებს, გამონაბოლქვი და შემშვები ჰაერი კი ცალკე გზებზე რჩება.', 'Выхлоп вращает турбину. Общий вал приводит компрессор, а выхлоп и впускной воздух остаются в разных трактах.'),
    scenario: {
      prompt: text('Draw two routes: exhaust manifold → turbine → exhaust; air filter → compressor → charge cooler → engine. What connects the routes without joining their airflow?', 'დახატე ორი გზა: გამოსაშვები კოლექტორი → ტურბინა → გამონაბოლქვი; ჰაერის ფილტრი → კომპრესორი → ინტერკულერი → ძრავა. რა აკავშირებს გზებს მათი ჰაერის ნაკადების შეერთების გარეშე?', 'Нарисуйте два пути: выпускной коллектор → турбина → выхлоп; воздушный фильтр → компрессор → охладитель → двигатель. Что связывает их, не соединяя потоки?'),
      reasoning: text('The shaft transfers mechanical energy from turbine to compressor. The compressor acts on fresh intake air; exhaust continues through the exhaust path.', 'ლილვი ტურბინიდან კომპრესორზე მექანიკურ ენერგიას გადასცემს. კომპრესორი ახალ შემშვებ ჰაერზე მოქმედებს; გამონაბოლქვი გამოსაშვებ გზას აგრძელებს.', 'Вал передаёт механическую энергию от турбины компрессору. Компрессор работает со свежим впускным воздухом, а выхлоп продолжает путь по выпуску.')
    },
    takeaways: [
      text('Name the turbine side and the compressor side.', 'დაასახელე ტურბინის მხარე და კომპრესორის მხარე.', 'Различайте сторону турбины и сторону компрессора.'),
      text('Trace each flow before drawing a fault conclusion.', 'დაზიანებაზე დასკვნამდე თითოეულ ნაკადს გაჰყევი.', 'Перед выводом о неисправности проследите каждый поток.')
    ]
  },
  cooling: {
    hook: text('Moving coolant carries heat away from the engine. Where does that heat go next?', 'მოძრავი გამაგრილებელი სითხე ძრავიდან სითბოს იღებს. შემდეგ სად მიდის ეს სითბო?', 'Циркулирующая охлаждающая жидкость отводит тепло от двигателя. Куда оно идёт дальше?'),
    concept: text('The pump moves coolant; the radiator transfers heat from coolant to air. Both the liquid path and the air path matter.', 'ტუმბო სითხეს ამოძრავებს; რადიატორი სითხის სითბოს ჰაერს გადასცემს. მნიშვნელოვანია სითხის გზაც და ჰაერის გზაც.', 'Помпа перемещает жидкость, а радиатор передаёт её тепло воздуху. Важны и жидкостный, и воздушный пути.'),
    scenario: {
      prompt: text('In a simulation, coolant circulation is normal but airflow through the radiator is weak. Is normal circulation enough to prove the whole cooling system is working well?', 'სიმულაციაში სითხის ცირკულაცია ნორმალურია, მაგრამ რადიატორში ჰაერის ნაკადი სუსტია. ადასტურებს ნორმალური ცირკულაცია მთელი გაგრილების სისტემის გამართულ მუშაობას?', 'В симуляции жидкость циркулирует нормально, но обдув радиатора слабый. Доказывает ли нормальная циркуляция исправную работу всей системы?'),
      reasoning: text('No. Coolant can circulate while heat transfer to air is limited. Follow heat from engine to coolant to radiator to air before judging the whole system.', 'არა. სითხე შეიძლება ცირკულირებდეს მაშინაც, როცა ჰაერში სითბოს გადაცემა შეზღუდულია. სისტემის შეფასებამდე მიჰყევი სითბოს გზას: ძრავა → სითხე → რადიატორი → ჰაერი.', 'Нет. Жидкость может циркулировать при ограниченной передаче тепла воздуху. До оценки системы проследите тепло: двигатель → жидкость → радиатор → воздух.')
    },
    takeaways: [
      text('Separate circulating coolant from rejecting heat.', 'გაარჩიე სითხის ცირკულაცია და სითბოს მოცილება.', 'Различайте циркуляцию жидкости и отвод тепла.'),
      text('A single normal reading does not establish the whole system.', 'ერთი ნორმალური მაჩვენებელი მთელი სისტემის გამართულობას არ ადგენს.', 'Одно нормальное показание не подтверждает исправность всей системы.')
    ]
  },
  charging: {
    hook: text('The starter turns the engine before the alternator can do its usual job. Where does that first energy come from?', 'სტარტერი ძრავას ატრიალებს მანამდე, სანამ გენერატორი ჩვეულ მუშაობას დაიწყებს. საიდან მოდის პირველი ენერგია?', 'Стартер вращает двигатель до того, как генератор начнёт обычную работу. Откуда берётся первая энергия?'),
    concept: text('The battery stores electrical energy, the starter uses it for starting, and the engine-driven alternator generates power while the engine runs.', 'აკუმულატორი ელექტროენერგიას ინახავს, სტარტერი მას დასაქოქად იყენებს, ხოლო ძრავით ამოძრავებული გენერატორი მუშაობისას ელექტროენერგიას გამოიმუშავებს.', 'Батарея хранит электроэнергию, стартер использует её для запуска, а приводимый двигателем генератор вырабатывает питание при его работе.'),
    scenario: {
      prompt: text('Put three roles in the starting story: stored energy, cranking the engine, replenishing the battery during engine operation. Which component belongs to each?', 'დაქოქვის ისტორიაში სამი როლი დაალაგე: შენახული ენერგია, ძრავის დატრიალება, მუშაობისას აკუმულატორის დამუხტვა. რომელი კომპონენტი შეესაბამება თითოეულს?', 'Сопоставьте три роли при запуске: запас энергии, прокручивание двигателя, пополнение заряда при работе. Какой компонент выполняет каждую?'),
      reasoning: text('Battery → starter → alternator. These are different jobs in one connected system, so a charging warning alone cannot establish which component failed.', 'აკუმულატორი → სტარტერი → გენერატორი. ეს ერთი დაკავშირებული სისტემის სხვადასხვა სამუშაოა, ამიტომ მხოლოდ დამუხტვის გაფრთხილება ვერ ადგენს, რომელი კომპონენტია დაზიანებული.', 'Батарея → стартер → генератор. Это разные задачи одной системы, поэтому одно предупреждение о зарядке не определяет неисправный компонент.')
    },
    takeaways: [
      text('Distinguish storing, starting and generating.', 'გაარჩიე ენერგიის შენახვა, დაქოქვა და გამომუშავება.', 'Различайте хранение энергии, запуск и выработку.'),
      text('Read a warning as a system clue, then seek more evidence.', 'გაფრთხილება სისტემის მინიშნებად მიიღე და მეტი მტკიცებულება მოიძიე.', 'Считайте предупреждение подсказкой о системе и ищите дополнительные данные.')
    ]
  },
  differential: {
    hook: text('Two driven wheels turn through the same corner. Why do they need different rotational speeds?', 'ორი წამყვანი თვალი ერთ მოსახვევში მოძრაობს. რატომ სჭირდება მათ ბრუნვის სხვადასხვა სიხშირე?', 'Два ведущих колеса проходят один поворот. Зачем им разные обороты?'),
    concept: text('The outside wheel follows a longer path in the same time. A differential permits different driven-wheel speeds while transmitting drive.', 'გარე თვალი იმავე დროში უფრო გრძელ გზას გადის. დიფერენციალი ბრუნვის გადაცემისას წამყვანი თვლების სხვადასხვა სიჩქარეს უშვებს.', 'Наружное колесо за то же время проходит больший путь. Дифференциал допускает разные обороты ведущих колёс, передавая тягу.'),
    scenario: {
      prompt: text('Sketch two arcs around the same corner: one for the inside wheel and one for the outside wheel. Which is longer? What must differ if both wheels finish the turn together?', 'ერთი მოსახვევის გარშემო ორი რკალი დახატე: შიდა და გარე თვლისთვის. რომელია გრძელი? რა უნდა განსხვავდებოდეს, თუ ორივე თვალი მოხვევას ერთად ამთავრებს?', 'Нарисуйте две дуги поворота: для внутреннего и наружного колеса. Какая длиннее? Что должно различаться, если оба колеса завершают поворот одновременно?'),
      reasoning: text('The outside arc is longer, so the outside wheel needs to cover more distance in the same time. The differential allows that wheel-speed difference.', 'გარე რკალი გრძელია, ამიტომ გარე თვალი იმავე დროში მეტ მანძილს უნდა გადიოდეს. დიფერენციალი თვლების სიჩქარის ამ სხვაობას უშვებს.', 'Наружная дуга длиннее: наружному колесу нужно пройти больше за то же время. Дифференциал допускает такую разницу оборотов.')
    },
    takeaways: [
      text('Compare the paths before comparing wheel speeds.', 'თვლების სიჩქარეებამდე მათი გზები შეადარე.', 'Перед сравнением оборотов сравните пути колёс.'),
      text('Check the exact differential type in vehicle documentation.', 'დიფერენციალის ზუსტი ტიპი მანქანის დოკუმენტაციაში გადაამოწმე.', 'Уточняйте тип дифференциала по документации автомобиля.')
    ]
  },
  combustion: {
    hook: text('A piston rises during both compression and exhaust. What tells those strokes apart?', 'დგუში მაღლა ადის შეკუმშვისასაც და გამოშვებისასაც. რა განასხვავებს ამ ტაქტებს?', 'Поршень поднимается и при сжатии, и при выпуске. Что различает эти такты?'),
    concept: text('The four-stroke sequence is intake, compression, power and exhaust. One complete cycle takes two crankshaft revolutions.', 'ოთხტაქტიანი თანმიმდევრობაა შეშვება, შეკუმშვა, მუშა სვლა და გამოშვება. ერთ სრულ ციკლს მუხლა ლილვის ორი ბრუნი სჭირდება.', 'Последовательность четырёх тактов: впуск, сжатие, рабочий ход, выпуск. Полный цикл занимает два оборота коленвала.'),
    scenario: {
      prompt: text('In the simplified diagram the piston rises and the exhaust valve is open. Name the stroke. What valve state would distinguish the other upward stroke?', 'გამარტივებულ დიაგრამაზე დგუში მაღლა მიდის და გამოსაშვები სარქველი ღიაა. დაასახელე ტაქტი. სარქველების რომელი მდგომარეობა განასხვავებდა მეორე აღმავალ ტაქტს?', 'На упрощённой схеме поршень идёт вверх, выпускной клапан открыт. Назовите такт. Какое состояние клапанов отличало бы другой ход вверх?'),
      reasoning: text('This is exhaust: the rising piston pushes gas out through the open exhaust valve. During simplified compression the valves are closed, trapping the charge as the piston rises.', 'ეს გამოშვებაა: აღმავალი დგუში აირს ღია გამოსაშვებ სარქველში გამოდევნის. გამარტივებული შეკუმშვისას სარქველები დახურულია და დგუში ცილინდრში ჩაკეტილ მუხტს კუმშავს.', 'Это выпуск: поднимающийся поршень выталкивает газ через открытый выпускной клапан. При упрощённом сжатии клапаны закрыты и заряд остаётся в цилиндре.')
    },
    takeaways: [
      text('Name the stroke using motion and valve state together.', 'ტაქტი მოძრაობისა და სარქველის მდგომარეობის ერთობლიობით დაასახელე.', 'Определяйте такт по движению и состоянию клапанов вместе.'),
      text('Remember four strokes, two crankshaft revolutions.', 'დაიმახსოვრე: ოთხი ტაქტი, მუხლა ლილვის ორი ბრუნი.', 'Запомните: четыре такта, два оборота коленвала.')
    ]
  },
  'engine-codes': {
    hook: text('A family code is a useful starting point. How much can it establish about one particular car?', 'ოჯახის კოდი კარგი საწყისი მინიშნებაა. რამდენის დადგენა შეუძლია მას ერთ კონკრეტულ მანქანაზე?', 'Код семейства — хорошая отправная точка. Что он доказывает о конкретном автомобиле?'),
    concept: text('A family groups related engines. A documented application ties that family to a specific vehicle; exact variants still matter.', 'ოჯახი მონათესავე ძრავებს აერთიანებს. დოკუმენტირებული გამოყენება ოჯახს კონკრეტულ მანქანას უკავშირებს; ზუსტ მოდიფიკაციას კვლავ აქვს მნიშვნელობა.', 'Семейство объединяет родственные двигатели. Документированное применение связывает его с автомобилем; точная модификация всё равно важна.'),
    scenario: {
      prompt: text('The lesson documents B58 in the 2016 340i and 740i. A parts listing only says “fits B58.” What information is still missing before assuming it fits a particular car?', 'გაკვეთილი B58-ს 2016 წლის 340i-სა და 740i-ში ადასტურებს. ნაწილის განცხადებაში მხოლოდ „თავსებადია B58-თან“ წერია. რა ინფორმაცია აკლია კონკრეტულ მანქანასთან თავსებადობის დასაშვებად?', 'В уроке B58 документирован для 340i и 740i 2016 года. В объявлении детали написано лишь «для B58». Каких данных не хватает для вывода о совместимости с конкретной машиной?'),
      reasoning: text('Match the exact engine variant, production details and vehicle application. A shared family name alone is not a component-compatibility guarantee.', 'შეაჯერე ძრავის ზუსტი მოდიფიკაცია, წარმოების მონაცემები და კონკრეტულ მანქანაში გამოყენება. მხოლოდ ოჯახის საერთო სახელი ნაწილის თავსებადობას არ იძლევა.', 'Сопоставьте точную модификацию, производственные данные и применение в автомобиле. Общее имя семейства не гарантирует совместимость детали.')
    },
    takeaways: [
      text('Pair a family name with its documented application.', 'ოჯახის სახელი მის დოკუმენტირებულ გამოყენებას დაუკავშირე.', 'Связывайте семейство с документированным применением.'),
      text('Use the exact variant for a fitment conclusion.', 'თავსებადობაზე დასკვნისთვის ზუსტი მოდიფიკაცია გამოიყენე.', 'Для вывода о совместимости уточняйте модификацию.')
    ]
  },
  'drivetrain-layouts': {
    hook: text('Start at the gearbox and follow the arrows. Which axles actually receive drive?', 'დაიწყე კოლოფიდან და ისრებს გაჰყევი. რომელი ღერძები იღებს ბრუნვას?', 'Начните от коробки и следуйте по стрелкам. Какие оси получают тягу?'),
    concept: text('Rear-wheel drive sends drive to the rear axle. All-wheel drive can send drive to both axles; the exact hardware depends on the vehicle.', 'უკანა ამძრავი ბრუნვას უკანა ღერძს გადასცემს. სრული ამძრავი ბრუნვას ორივე ღერძზე შეიძლება გადასცემდეს; ზუსტი მოწყობილობა მანქანაზეა დამოკიდებული.', 'Задний привод передаёт тягу задней оси. Полный может передавать её обеим осям; конкретное устройство зависит от автомобиля.'),
    scenario: {
      prompt: text('Compare the documented F10 M5 and M3 CS examples. Which sends drive to the rear axle as rear-wheel drive, and which is documented with M xDrive?', 'შეადარე F10 M5-ისა და M3 CS-ის დოკუმენტირებული მაგალითები. რომელს აქვს უკანა ამძრავი და რომელი არის აღწერილი M xDrive-ით?', 'Сравните документированные F10 M5 и M3 CS. Какой имеет задний привод, а какой описан с M xDrive?'),
      reasoning: text('The linked F10 M5 example is rear-wheel drive; the linked M3 CS example has M xDrive. These describe those configurations, so another car still needs its own model and production details checked.', 'მითითებული F10 M5-ის მაგალითი უკანა ამძრავია; M3 CS-ის მაგალითს M xDrive აქვს. ეს სწორედ ამ კონფიგურაციებს აღწერს, ამიტომ სხვა მანქანის მოდელი და წარმოების მონაცემები ცალკე უნდა შემოწმდეს.', 'У приведённого F10 M5 задний привод, у M3 CS — M xDrive. Это сведения об этих конфигурациях; другую машину нужно проверять по её модели и производственным данным.')
    },
    takeaways: [
      text('Trace the drive path instead of guessing from a badge.', 'ნიშნიდან ვარაუდის ნაცვლად ბრუნვის გზას გაჰყევი.', 'Прослеживайте путь тяги вместо догадки по эмблеме.'),
      text('Keep each layout tied to the documented vehicle.', 'თითოეული განლაგება დოკუმენტირებულ მანქანას დაუკავშირე.', 'Связывайте каждую схему с документированным автомобилем.')
    ]
  },
  'm-performance': {
    hook: text('Two cars both carry an M name. Which hardware details can you actually compare from their sources?', 'ორივე მანქანას M სახელი აქვს. მათი წყაროებით მოწყობილობის რომელი დეტალების შედარება შეგიძლია?', 'Оба автомобиля носят имя M. Какие особенности устройства можно сравнить по их источникам?'),
    concept: text('M models vary across generations. Study the documented engine, drivetrain, chassis and brakes for the particular model.', 'M მოდელები თაობებს შორის განსხვავდება. შეისწავლე კონკრეტული მოდელის დოკუმენტირებული ძრავა, ამძრავი, შასი და მუხრუჭები.', 'Модели M различаются по поколениям. Изучайте двигатель, привод, шасси и тормоза конкретной модели по документации.'),
    scenario: {
      prompt: text('The F10 M5 source lists an S63 V8, rear-wheel drive and Active M Differential. Does the M name establish the same combination for the M3 CS?', 'F10 M5-ის წყარო ასახელებს S63 V8-ს, უკანა ამძრავსა და Active M Differential-ს. ადასტურებს M სახელი იმავე კომბინაციას M3 CS-ისთვის?', 'В источнике F10 M5 указаны S63 V8, задний привод и Active M Differential. Доказывает ли имя M такую же комбинацию у M3 CS?'),
      reasoning: text('No. The M3 CS release documents a different combination including M xDrive. Compare each model’s own source rather than carrying one car’s parts list to another.', 'არა. M3 CS-ის მასალა სხვა კომბინაციას აღწერს, მათ შორის M xDrive-ს. შეადარე თითოეული მოდელის საკუთარი წყარო და ერთი მანქანის ნაწილების სია მეორეზე არ გადაიტანო.', 'Нет. Материал M3 CS описывает другую комбинацию, включая M xDrive. Сравнивайте собственные источники моделей, не перенося список деталей с одной машины на другую.')
    },
    takeaways: [
      text('Name the model and generation with every example.', 'თითოეულ მაგალითთან მოდელი და თაობა დაასახელე.', 'Для каждого примера называйте модель и поколение.'),
      text('Compare documented systems one at a time.', 'დოკუმენტირებული სისტემები სათითაოდ შეადარე.', 'Сравнивайте документированные системы по очереди.')
    ]
  },
  electrification: {
    hook: text('During propulsion energy goes toward the wheels. What changes when the motor generates during deceleration?', 'ამძრავის რეჟიმში ენერგია თვლებისკენ მიდის. რა იცვლება, როცა შენელებისას ძრავა გენერატორად მუშაობს?', 'При тяге энергия идёт к колёсам. Что меняется, когда при замедлении мотор работает генератором?'),
    concept: text('Electric drive sends battery energy through power electronics to the motor. Regeneration can return some motion energy to the battery under suitable conditions.', 'ელექტროამძრავი აკუმულატორის ენერგიას ძალოვანი ელექტრონიკის გავლით ძრავას გადასცემს. სათანადო პირობებში რეკუპერაცია მოძრაობის ენერგიის ნაწილს აკუმულატორში აბრუნებს.', 'Электропривод передаёт энергию батареи через силовую электронику мотору. При подходящих условиях рекуперация возвращает часть энергии движения в батарею.'),
    scenario: {
      prompt: text('Reverse the propulsion arrows for regeneration. Now imagine a nearly full battery: why would the car still need friction brakes?', 'რეკუპერაციისთვის ამძრავის ისრები შეაბრუნე. ახლა წარმოიდგინე თითქმის სავსე აკუმულატორი: რატომ სჭირდება მანქანას კვლავ ხახუნის მუხრუჭები?', 'Разверните стрелки тяги для рекуперации. Теперь представьте почти полную батарею: зачем машине по-прежнему нужны фрикционные тормоза?'),
      reasoning: text('Energy can flow from the wheels through the generating motor toward the battery. A nearly full battery has less ability to accept energy, so regeneration may be limited and friction braking remains necessary.', 'ენერგია თვლებიდან გენერატორად მომუშავე ძრავის გავლით აკუმულატორისკენ შეიძლება წავიდეს. თითქმის სავსე აკუმულატორს ნაკლები ენერგიის მიღება შეუძლია, ამიტომ რეკუპერაცია შეიძლება შეიზღუდოს და ხახუნით დამუხრუჭება კვლავ საჭიროა.', 'Энергия может идти от колёс через генерирующий мотор к батарее. Почти полная батарея принимает меньше энергии, поэтому рекуперация может ограничиваться и фрикционные тормоза остаются необходимыми.')
    },
    takeaways: [
      text('Show the direction of energy, not just the components.', 'კომპონენტებთან ერთად ენერგიის მიმართულებაც აჩვენე.', 'Показывайте направление энергии вместе с компонентами.'),
      text('Regeneration recovers some energy and has limits.', 'რეკუპერაცია ენერგიის ნაწილს აღადგენს და შეზღუდვები აქვს.', 'Рекуперация возвращает часть энергии и имеет ограничения.')
    ]
  },
  'basics-checkpoint': {
    hook: text('Can you explain one drive path using three different quantities without treating them as the same thing?', 'შეგიძლია ერთი ამძრავის გზა სამი განსხვავებული სიდიდით ახსნა და ისინი ერთმანეთში არ აგერიოს?', 'Сможете объяснить один путь тяги тремя разными величинами, не смешивая их?'),
    concept: text('Torque is turning effect, RPM is rotational speed and power is the rate of doing work. The transmission connects their speed-and-torque relationship to the drive path.', 'მომენტი მაბრუნებელი ეფექტია, RPM ბრუნვის სიხშირეა, სიმძლავრე კი მუშაობის შესრულების სიჩქარეა. კოლოფი სიჩქარისა და მომენტის თანაფარდობას ამძრავის გზას უკავშირებს.', 'Момент — вращающее действие, RPM — обороты, мощность — скорость выполнения работы. Коробка связывает соотношение оборотов и момента с передачей тяги.'),
    scenario: {
      prompt: text('Say the path from engine to driven wheels. Then place an ideal 3:1 reduction in it: if input speed is 3,000 RPM, what is output speed and what happens to torque?', 'თქვი გზა ძრავიდან წამყვან თვლებამდე. შემდეგ მასში იდეალური 3:1 რედუქცია ჩასვი: თუ შემავალი სიჩქარეა 3 000 RPM, რა იქნება გამოსასვლელი და რა მოუვა მომენტს?', 'Назовите путь от двигателя к ведущим колёсам. Добавьте идеальное понижение 3:1: при 3 000 RPM на входе какие будут обороты на выходе и что произойдёт с моментом?'),
      reasoning: text('Engine → transmission → differential → driven wheels. In the ideal 3:1 reduction, speed becomes 1,000 RPM and torque triples. The ratio changes speed and torque together.', 'ძრავა → გადაცემათა კოლოფი → დიფერენციალი → წამყვანი თვლები. იდეალურ 3:1 რედუქციაში სიჩქარე 1 000 RPM ხდება, მომენტი კი სამმაგდება. შეფარდება სიჩქარესა და მომენტს ერთად ცვლის.', 'Двигатель → коробка → дифференциал → ведущие колёса. В идеальном понижении 3:1 обороты станут 1 000 RPM, а момент утроится. Передаточное число меняет обе величины вместе.')
    },
    takeaways: [
      text('Give each quantity its own meaning and unit.', 'თითოეულ სიდიდეს საკუთარი მნიშვნელობა და ერთეული დაუკავშირე.', 'Связывайте каждую величину с её смыслом и единицей.'),
      text('Check speed and torque together after a ratio change.', 'შეფარდების შეცვლის შემდეგ სიჩქარე და მომენტი ერთად შეამოწმე.', 'После изменения передаточного числа проверяйте обороты и момент вместе.')
    ]
  },
  'basics-finale': {
    hook: text('You now know several systems. Can you give each one a job without confusing the paths between them?', 'უკვე რამდენიმე სისტემა იცი. შეგიძლია თითოეულის დანიშნულება ისე ახსნა, რომ მათი გზები არ აგერიოს?', 'Вы уже знаете несколько систем. Сможете объяснить задачу каждой, не перепутав их пути?'),
    concept: text('Air compression, heat rejection, electrical generation and wheel-speed differences are different jobs performed by connected systems.', 'ჰაერის შეკუმშვა, სითბოს მოცილება, ელექტროენერგიის გამომუშავება და თვლების სიჩქარის სხვაობის დაშვება დაკავშირებული სისტემების განსხვავებული სამუშაოებია.', 'Сжатие воздуха, отвод тепла, выработка электроэнергии и допуск разницы оборотов колёс — разные задачи связанных систем.'),
    scenario: {
      prompt: text('Name the component for each job: compress intake air; transfer coolant heat to air; generate electrical power while the engine runs; permit different driven-wheel speeds.', 'დაასახელე კომპონენტი თითოეული სამუშაოსთვის: შემშვები ჰაერის შეკუმშვა; სითხის სითბოს ჰაერისთვის გადაცემა; მუშაობისას ელექტროენერგიის გამომუშავება; წამყვანი თვლების სხვადასხვა სიჩქარის დაშვება.', 'Назовите компонент для каждой задачи: сжать впускной воздух; передать тепло жидкости воздуху; выработать питание при работе двигателя; допустить разные обороты ведущих колёс.'),
      reasoning: text('Turbocharger compressor; radiator; alternator; differential. Explain each answer by its input and output, then trace the complete engine-to-road path once more.', 'ტურბოკომპრესორის კომპრესორი; რადიატორი; გენერატორი; დიფერენციალი. თითოეული პასუხი შესავალი და გამოსავალი ნაკადით ახსენი, შემდეგ კიდევ ერთხელ გაჰყევი გზას ძრავიდან გზის ზედაპირამდე.', 'Компрессор турбокомпрессора; радиатор; генератор; дифференциал. Объясните ответы через вход и выход, затем ещё раз проследите весь путь от двигателя к дороге.')
    },
    takeaways: [
      text('Explain a component through the job it performs.', 'კომპონენტი მისი სამუშაოს მიხედვით ახსენი.', 'Объясняйте компонент через выполняемую задачу.'),
      text('Connect the systems without merging their roles.', 'დააკავშირე სისტემები ისე, რომ მათი როლები გაარჩიო.', 'Связывайте системы, сохраняя различие их ролей.')
    ]
  }
};

const coaching = (hook, concept, prompt, reasoning, first, second) => ({hook, concept, scenario:{prompt, reasoning}, takeaways:[first, second]});
Object.assign(guides, {
  suspension: coaching(
    text('After a bump, a spring gives energy back. What helps the repeated bouncing settle?', 'ბიძგის შემდეგ ზამბარა ენერგიას აბრუნებს. რა ეხმარება განმეორებითი რხევის ჩაქრობას?', 'После неровности пружина отдаёт энергию. Что помогает затихнуть повторным колебаниям?'),
    text('A spring stores and releases energy. A damper resists movement and dissipates motion energy as heat.', 'ზამბარა ენერგიას ინახავს და აბრუნებს. ამორტიზატორი მოძრაობას ეწინააღმდეგება და მოძრაობის ენერგიას სითბოდ ფანტავს.', 'Пружина запасает и отдаёт энергию. Амортизатор сопротивляется движению и рассеивает его энергию в виде тепла.'),
    text('In the animation, the body keeps moving after one bump. Which role helps those movements settle: storing energy in a spring or dissipating it in a damper?', 'ანიმაციაში ერთი ბიძგის შემდეგ ძარა მოძრაობას აგრძელებს. რომელი როლი ეხმარება ამ რხევის ჩაქრობას: ზამბარაში ენერგიის შენახვა თუ ამორტიზატორში გაფანტვა?', 'В анимации кузов продолжает двигаться после одной неровности. Что помогает затуханию: запасание энергии пружиной или рассеивание амортизатором?'),
    text('Damping dissipates motion energy instead of repeatedly returning it. A spring’s stiffness and a damper’s resistance describe different properties, so changing damping is not the same as changing the spring.', 'ამორტიზაცია მოძრაობის ენერგიას ფანტავს იმის ნაცვლად, რომ კვლავ დააბრუნოს. ზამბარის სიხისტე და ამორტიზატორის წინააღმდეგობა სხვადასხვა თვისებაა, ამიტომ ამორტიზაციის შეცვლა ზამბარის შეცვლას არ ნიშნავს.', 'Демпфирование рассеивает энергию движения вместо её повторного возврата. Жёсткость пружины и сопротивление амортизатора — разные свойства; изменение демпфирования не равно изменению пружины.'),
    text('Distinguish storing energy from dissipating it.', 'გაარჩიე ენერგიის შენახვა და გაფანტვა.', 'Различайте запасание и рассеивание энергии.'),
    text('Judge damping by the response, not “firmer is better.”', 'ამორტიზაცია რეაქციით შეაფასე და არა წესით „ხისტი უკეთესია“.', 'Оценивайте отклик, а не правило «жёстче значит лучше».')
  ),
  electronics: coaching(
    text('A controller sends a command. How does it know whether the car actually responded?', 'კონტროლერი ბრძანებას აგზავნის. როგორ იგებს, მართლა უპასუხა თუ არა მანქანამ?', 'Контроллер отправил команду. Как узнать, действительно ли автомобиль отреагировал?'),
    text('Sensors provide measurements, a controller compares them and actuators act. New measurements provide feedback about the result.', 'სენსორები გაზომვებს იძლევა, კონტროლერი მათ ადარებს, შემსრულებელი მექანიზმები კი მოქმედებს. ახალი გაზომვები შედეგის უკუკავშირს ქმნის.', 'Датчики дают измерения, контроллер их сопоставляет, исполнительные механизмы действуют. Новые измерения дают обратную связь о результате.'),
    text('In a simulated stability-control loop, torque is reduced and motion is measured again. Why is that second measurement useful even though the command was already sent?', 'სტაბილიზაციის სიმულირებულ ციკლში მომენტი მცირდება და მოძრაობა კვლავ იზომება. რატომ არის მეორე გაზომვა სასარგებლო, თუ ბრძანება უკვე გაგზავნილია?', 'В учебном контуре стабилизации момент снижен и движение измеряется снова. Зачем нужно второе измерение, если команда уже отправлена?'),
    text('The measurement checks the physical response and informs the next command. Sending a command establishes intent; feedback is needed to assess what actually happened.', 'გაზომვა რეალურ რეაქციას ამოწმებს და შემდეგ ბრძანებას ეხმარება. ბრძანების გაგზავნა განზრახვას გვიჩვენებს; მომხდარის შესაფასებლად უკუკავშირია საჭირო.', 'Измерение проверяет физический отклик и помогает выбрать следующую команду. Отправка команды показывает намерение; для оценки результата нужна обратная связь.'),
    text('Trace measure → compare → act → measure again.', 'მიჰყევი: გაზომვა → შედარება → მოქმედება → ხელახლა გაზომვა.', 'Проследите: измерение → сравнение → действие → новое измерение.'),
    text('Separate a detected condition from a failed part.', 'გაარჩიე გამოვლენილი მდგომარეობა და დაზიანებული ნაწილი.', 'Отличайте обнаруженное условие от неисправной детали.')
  ),
  'part-turbocharger': coaching(
    text('Find two gas paths and one shared shaft. Which side takes energy, and which side compresses air?', 'იპოვე აირის ორი გზა და ერთი საერთო ლილვი. რომელი მხარე იღებს ენერგიას და რომელი კუმშავს ჰაერს?', 'Найдите два газовых тракта и общий вал. Какая сторона получает энергию, а какая сжимает воздух?'),
    text('The turbine receives exhaust energy and drives the compressor through a shaft. The compressor supplies compressed intake air.', 'ტურბინა გამონაბოლქვის ენერგიას იღებს და ლილვით კომპრესორს ამოძრავებს. კომპრესორი შეკუმშულ შემშვებ ჰაერს აწვდის.', 'Турбина получает энергию выхлопа и через вал приводит компрессор. Компрессор подаёт сжатый впускной воздух.'),
    text('A simulated engine has low boost, and you can see a leaking intake hose after the compressor. Does the low-boost reading by itself prove the turbocharger is faulty?', 'სიმულირებულ ძრავას დაბალი ჩაბერვა აქვს და კომპრესორის შემდეგ შემშვებ შლანგში გაჟონვა ჩანს. ამტკიცებს მხოლოდ დაბალი წნევა ტურბოკომპრესორის დაზიანებას?', 'В симуляции наддув низкий и видна негерметичная впускная трубка после компрессора. Доказывает ли одно низкое давление неисправность турбокомпрессора?'),
    text('No. A hose leak can lose compressed air before it reaches the engine. Use the visible leak as evidence about the intake path rather than assigning every boost symptom to the turbo.', 'არა. შლანგის გაჟონვამ შეიძლება შეკუმშული ჰაერი ძრავამდე მისვლამდე დაკარგოს. ხილული გაჟონვა შემშვები გზის მტკიცებულებად გამოიყენე და ყველა სიმპტომი ტურბოს არ მიაწერო.', 'Нет. Через негерметичную трубку сжатый воздух может уйти до двигателя. Учитывайте видимую утечку во впуске, а не относите любой симптом наддува к турбине.'),
    text('Identify turbine, shaft and compressor separately.', 'ტურბინა, ლილვი და კომპრესორი ცალ-ცალკე ამოიცანი.', 'Различайте турбину, вал и компрессор.'),
    text('Check the connected air path when interpreting boost.', 'ჩაბერვის შეფასებისას დაკავშირებული ჰაერის გზა გაითვალისწინე.', 'При оценке наддува учитывайте весь воздушный тракт.')
  ),
  'part-air-filter': coaching(
    text('Filter material traps dirt. What stops intake air from simply going around that material?', 'ფილტრის მასალა ჭუჭყს აკავებს. რა უშლის შემშვებ ჰაერს ამ მასალის გვერდის ავლას?', 'Материал фильтра задерживает грязь. Что мешает воздуху обойти этот материал?'),
    text('Pleated material provides a filtering surface. The housing and seals help ensure intake air passes through that surface.', 'ნაკეცები ფილტრაციის ზედაპირს ქმნის. კორპუსი და შემამჭიდროებლები ჰაერს ამ ზედაპირში გავლას უზრუნველყოფინებს.', 'Складчатый материал создаёт фильтрующую поверхность. Корпус и уплотнения помогают направлять воздух через неё.'),
    text('Compare two teaching examples: a restricted filter element and a clean element with a poor housing seal. Do they raise the same concern about the intake air?', 'შეადარე ორი სასწავლო მაგალითი: შეზღუდული გამტარობის ელემენტი და სუფთა ელემენტი კორპუსის ცუდი დალუქვით. შემშვებ ჰაერთან დაკავშირებით ერთსა და იმავე პრობლემას ქმნის ისინი?', 'Сравните два примера: забитый элемент и чистый элемент с плохим уплотнением корпуса. Одинаковую ли проблему для впускного воздуха они создают?'),
    text('Restriction can limit airflow; a poor seal can allow dirt to bypass the element. Evaluate the filtering material and the route around it as two parts of the same assembly.', 'შეზღუდვამ ჰაერის ნაკადი შეიძლება შეამციროს; ცუდმა დალუქვამ ჭუჭყი ელემენტის გვერდის ავლით გაატაროს. მასალა და მის გარშემო გზა ერთი კვანძის ორ ნაწილად შეაფასე.', 'Засорение может ограничивать поток, а плохое уплотнение — пропускать грязь в обход элемента. Оценивайте материал и обходной путь как части одного узла.'),
    text('Look for the element, housing and seals together.', 'ელემენტი, კორპუსი და შემამჭიდროებლები ერთად მოძებნე.', 'Рассматривайте элемент, корпус и уплотнения вместе.'),
    text('Separate restricted flow from unfiltered bypass.', 'გაარჩიე შეზღუდული ნაკადი და გაუფილტრავი შემოვლითი გზა.', 'Различайте ограничение потока и обход фильтра.')
  ),
  'part-spark-plug': coaching(
    text('The ignition coil supplies high voltage. Where does the spark actually begin the flame?', 'ანთების კოჭა მაღალ ძაბვას იძლევა. უშუალოდ სად იწყებს ნაპერწკალი წვას?', 'Катушка подаёт высокое напряжение. Где искра непосредственно начинает горение?'),
    text('A spark plug’s electrodes reach the combustion chamber. High voltage creates a discharge across their gap to begin combustion.', 'სანთლის ელექტროდები წვის კამერაშია. მაღალი ძაბვა მათ შორის ღრეჩოში განმუხტვას ქმნის და წვას იწყებს.', 'Электроды свечи выходят в камеру сгорания. Высокое напряжение создаёт разряд в зазоре и начинает горение.'),
    text('Follow the simplified ignition path: coil → plug terminal → electrode gap. Which item supplies high voltage, and which provides the gap where the spark occurs?', 'მიჰყევი ანთების გამარტივებულ გზას: კოჭა → სანთლის კონტაქტი → ელექტროდების ღრეჩო. რომელი იძლევა მაღალ ძაბვას და რომელშია ნაპერწკლის წარმოქმნის ღრეჩო?', 'Проследите упрощённый путь: катушка → контакт свечи → электродный зазор. Кто создаёт высокое напряжение, а кто предоставляет зазор для искры?'),
    text('The coil supplies the high-voltage pulse; the plug provides the electrode gap in the chamber. A misfire can involve plugs, coils, fuel or compression, so the symptom does not choose one part.', 'კოჭა მაღალი ძაბვის იმპულსს აწვდის; სანთელი კამერაში ელექტროდების ღრეჩოს ქმნის. წვის გამოტოვება სანთელს, კოჭას, საწვავს ან შეკუმშვას შეიძლება უკავშირდებოდეს, ამიტომ სიმპტომი ერთ ნაწილს არ არჩევს.', 'Катушка даёт высоковольтный импульс, свеча — зазор в камере. Пропуски могут быть связаны со свечами, катушками, топливом или компрессией; один симптом не выбирает деталь.'),
    text('Connect the plug’s shape to its place in the chamber.', 'სანთლის ფორმა კამერაში მის ადგილს დაუკავშირე.', 'Связывайте форму свечи с её местом в камере.'),
    text('Treat a misfire as evidence needing context.', 'წვის გამოტოვება კონტექსტის საჭირო მტკიცებულებად მიიღე.', 'Рассматривайте пропуск как данные, требующие контекста.')
  ),
  'part-ignition-coil': coaching(
    text('A battery supplies low voltage. How does an ignition system obtain the pulse a spark plug needs?', 'აკუმულატორი დაბალ ძაბვას იძლევა. როგორ იღებს ანთების სისტემა სანთლისთვის საჭირო იმპულსს?', 'Батарея даёт низкое напряжение. Откуда система зажигания берёт импульс, нужный свече?'),
    text('The coil uses a changing magnetic field to produce a high-voltage pulse. The spark plug uses that pulse at its electrode gap.', 'კოჭა ცვალებად მაგნიტურ ველს მაღალი ძაბვის იმპულსის შესაქმნელად იყენებს. სანთელი ამ იმპულსს ელექტროდების ღრეჩოში იყენებს.', 'Катушка использует изменение магнитного поля для создания высоковольтного импульса. Свеча использует его в электродном зазоре.'),
    text('In the lesson diagram, current first builds a magnetic field and is then interrupted. Which component makes the high-voltage pulse, and which component creates the spark gap?', 'გაკვეთილის დიაგრამაზე დენი ჯერ მაგნიტურ ველს ქმნის და შემდეგ წყდება. რომელი კომპონენტი ქმნის მაღალი ძაბვის იმპულსს და რომელშია ნაპერწკლის ღრეჩო?', 'На схеме ток сначала создаёт магнитное поле, затем прерывается. Какой компонент формирует высоковольтный импульс, а в каком находится искровой зазор?'),
    text('The coil generates the pulse; the plug contains the gap. Keeping those jobs separate also explains why a misfire alone cannot tell you whether a coil, plug or another engine system is responsible.', 'კოჭა იმპულსს წარმოქმნის; ღრეჩო სანთელშია. ამ როლების გარჩევა იმასაც ხსნის, რატომ ვერ ადგენს მხოლოდ წვის გამოტოვება კოჭის, სანთლის თუ სხვა სისტემის პასუხისმგებლობას.', 'Катушка формирует импульс, зазор находится в свече. Разделение этих ролей объясняет, почему один пропуск не определяет причину: катушку, свечу или другую систему двигателя.'),
    text('Follow electrical energy from supply to spark.', 'მიჰყევი ელექტროენერგიას კვებიდან ნაპერწკლამდე.', 'Проследите электроэнергию от питания до искры.'),
    text('Keep coil function separate from plug function.', 'გაარჩიე კოჭის და სანთლის ფუნქციები.', 'Различайте задачи катушки и свечи.')
  ),
  'part-fuel-injector': coaching(
    text('Both port and direct injectors deliver fuel. Where does each one put the spray?', 'პორტული და პირდაპირი ინჟექტორი ორივე საწვავს აწვდის. სად აფრქვევს თითოეული?', 'Оба типа форсунок подают топливо. Куда направляет распыл портовая и непосредственная форсунка?'),
    text('A port injector sprays into an intake port; a direct injector sprays into the combustion chamber. Their locations and hardware differ.', 'პორტული ინჟექტორი შემშვებ არხში აფრქვევს; პირდაპირი — წვის კამერაში. მათი მდებარეობა და მოწყობილობა განსხვავდება.', 'Портовая форсунка распыляет во впускной канал, непосредственная — в камеру сгорания. Их расположение и устройство различаются.'),
    text('An image shows an injector, but does not establish the complete vehicle application. What should you locate in the system diagram before deciding whether it is port or direct injection?', 'ფოტოზე ინჟექტორი ჩანს, მაგრამ მანქანაში სრული გამოყენება დადგენილი არ არის. სისტემის სქემაზე რა უნდა მოძებნო, სანამ პორტულ ან პირდაპირ შეშხეფებას დაადგენ?', 'На фото видна форсунка, но применение в автомобиле ещё не установлено. Что нужно найти на схеме перед выводом о портовом или непосредственном впрыске?'),
    text('Locate where the fuel leaves the injector relative to the intake port and combustion chamber. Use its documented system application; a photo of one injector is not proof of the layout in another vehicle.', 'იპოვე, სად გამოდის საწვავი შემშვებ არხსა და წვის კამერასთან მიმართებით. გამოიყენე დოკუმენტირებული სისტემური გამოყენება; ერთი ინჟექტორის ფოტო სხვა მანქანის განლაგებას არ ამტკიცებს.', 'Определите место выхода топлива относительно впускного канала и камеры. Используйте документированное применение: фото одной форсунки не доказывает схему другой машины.'),
    text('Classify injection by where the fuel is delivered.', 'შეშხეფება საწვავის მიწოდების ადგილის მიხედვით განსაზღვრე.', 'Определяйте тип впрыска по месту подачи топлива.'),
    text('Check pressure, control and application in context.', 'წნევა, მართვა და გამოყენება კონტექსტში შეამოწმე.', 'Рассматривайте давление, управление и применение в контексте.')
  ),
  'part-alternator': coaching(
    text('The engine turns a pulley, but the battery needs electrical energy. What conversion happens between them?', 'ძრავა შკივს ატრიალებს, აკუმულატორს კი ელექტროენერგია სჭირდება. რა გარდაქმნა ხდება მათ შორის?', 'Двигатель вращает шкив, а батарее нужна электроэнергия. Какое преобразование происходит между ними?'),
    text('An alternator converts engine-driven rotation into electrical power. Its rectifier converts alternating current to direct current and regulation controls output.', 'გენერატორი ძრავისგან მიღებულ ბრუნვას ელექტროენერგიად გარდაქმნის. გამმართველი ცვლად დენს მუდმივად გარდაქმნის, რეგულირება კი გამომუშავებას მართავს.', 'Генератор превращает вращение от двигателя в электроэнергию. Выпрямитель преобразует переменный ток в постоянный, а регулирование управляет выходом.'),
    text('A charging warning appears in a simulated belt-driven system. Before naming the alternator as the failed part, which connected items from this lesson also deserve consideration?', 'სიმულირებულ ღვედიან სისტემაში დამუხტვის გაფრთხილება ჩნდება. გენერატორის დაზიანებულად დასახელებამდე ამ გაკვეთილის რომელი დაკავშირებული ნაწილებიც უნდა გაითვალისწინო?', 'В учебной системе с ременным приводом появилось предупреждение о зарядке. Какие связанные элементы урока нужно учесть до вывода о неисправности генератора?'),
    text('The belt, battery and wiring are part of the same charging story. The warning identifies a concern; it does not establish that the alternator alone caused it.', 'ღვედი, აკუმულატორი და გაყვანილობა იმავე დამუხტვის სისტემის ნაწილია. გაფრთხილება პრობლემაზე მიუთითებს, მაგრამ მხოლოდ გენერატორის ბრალს არ ადგენს.', 'Ремень, батарея и проводка относятся к той же системе зарядки. Предупреждение указывает на проблему, но не доказывает, что причина только в генераторе.'),
    text('Trace mechanical input and electrical output.', 'მიჰყევი მექანიკურ შესავალსა და ელექტრულ გამოსავალს.', 'Проследите механический вход и электрический выход.'),
    text('Include the drive belt and electrical connections.', 'მოიცავი ამძრავი ღვედი და ელექტრული კავშირები.', 'Учитывайте приводной ремень и электрические соединения.')
  ),
  'part-throttle-body': coaching(
    text('A controller requests an opening. Which part moves, and how does the system report its position?', 'კონტროლერი გახსნას ითხოვს. რომელი ნაწილი მოძრაობს და როგორ იუწყება სისტემა მის პოზიციას?', 'Контроллер запросил открытие. Что движется и как система сообщает его положение?'),
    text('A throttle plate changes the intake opening. In an electronic throttle, an actuator moves the plate and position feedback reports the result.', 'დროსელის ფირფიტა შემშვებ ღიობს ცვლის. ელექტრონულ დროსელში მექანიზმი ფირფიტას ამოძრავებს, პოზიციის უკუკავშირი კი შედეგს იუწყება.', 'Дроссельная заслонка меняет проход впуска. В электронной системе привод двигает заслонку, а обратная связь сообщает положение.'),
    text('In a simulated electronic throttle, the requested opening changes but reported position does not. Which two observations should you compare before assuming the plate followed the command?', 'ელექტრონული დროსელის სიმულაციაში მოთხოვნილი გახსნა იცვლება, მოხსენებული პოზიცია კი არა. რომელი ორი მონაცემი უნდა შეადარო, სანამ ჩათვლი, რომ ფირფიტამ ბრძანება შეასრულა?', 'В симуляции электронного дросселя запрос открытия меняется, а сообщаемое положение — нет. Какие два наблюдения сопоставить до вывода, что заслонка выполнила команду?'),
    text('Compare the requested position with the measured response. A command is not proof of movement, and an inconsistent position signal still needs investigation of actuator, sensor and wiring.', 'შეადარე მოთხოვნილი პოზიცია და გაზომილი რეაქცია. ბრძანება მოძრაობის მტკიცებულება არ არის, ხოლო არათანმიმდევრული სიგნალი მექანიზმის, სენსორისა და გაყვანილობის გამოკვლევას მოითხოვს.', 'Сопоставьте запрос и измеренный отклик. Команда не доказывает движение; несогласованный сигнал положения требует проверки привода, датчика и проводки.'),
    text('Identify the plate, actuator and position feedback.', 'ამოიცანი ფირფიტა, ამძრავი და პოზიციის უკუკავშირი.', 'Различайте заслонку, привод и обратную связь положения.'),
    text('Compare requested movement with measured movement.', 'შეადარე მოთხოვნილი და გაზომილი მოძრაობა.', 'Сравнивайте запрошенное и измеренное движение.')
  ),
  'part-brake-caliper': coaching(
    text('Hydraulic pressure arrives at the wheel. How does the caliper turn it into pad force?', 'ჰიდრავლიკური წნევა თვლამდე მიდის. როგორ გარდაქმნის სუპორტი მას ხუნდების ძალად?', 'Гидравлическое давление пришло к колесу. Как суппорт превращает его в усилие колодок?'),
    text('Pressure moves caliper pistons to apply the pads to the disc. Floating and fixed calipers use different arrangements to apply both sides.', 'წნევა სუპორტის დგუშებს ამოძრავებს და ხუნდებს დისკს აჭერს. მცურავი და ფიქსირებული სუპორტები ორივე მხარეს სხვადასხვა მოწყობით მოქმედებს.', 'Давление двигает поршни суппорта и прижимает колодки к диску. Плавающие и неподвижные суппорты по-разному прикладывают усилие с двух сторон.'),
    text('Compare the lesson’s two layouts: one caliper slides to apply both pads, while the other has pistons on opposing sides. Which is floating, and which is fixed?', 'შეადარე გაკვეთილის ორი განლაგება: ერთი სუპორტი ორივე ხუნდის მისაჭერად სრიალებს, მეორეს კი მოპირდაპირე მხარეებზე დგუშები აქვს. რომელია მცურავი და რომელი ფიქსირებული?', 'Сравните схемы урока: один суппорт скользит для прижатия обеих колодок, у другого поршни по противоположным сторонам. Какой плавающий, а какой неподвижный?'),
    text('The sliding arrangement is floating; the opposing-piston arrangement is fixed. Both use pressure to create pad force, so distinguish the mechanism rather than judging by the caliper’s size or color.', 'მოსრიალე მოწყობა მცურავია; მოპირდაპირე დგუშების მოწყობა — ფიქსირებული. ორივე წნევით ხუნდის ძალას ქმნის, ამიტომ მექანიზმი გაარჩიე და არა სუპორტის ზომა ან ფერი.', 'Скользящая схема — плавающая, с противоположными поршнями — неподвижная. Обе превращают давление в прижим: различайте механизм, а не размер или цвет суппорта.'),
    text('Trace pressure → piston movement → pad force.', 'მიჰყევი: წნევა → დგუშის მოძრაობა → ხუნდის ძალა.', 'Проследите: давление → движение поршня → прижим колодки.'),
    text('Use the layout to distinguish caliper types.', 'სუპორტების ტიპები მოწყობის მიხედვით გაარჩიე.', 'Различайте типы суппортов по их устройству.')
  ),
  'model-f80': coaching(
    text('The lesson shows an M3 F80. Which details make that identification more useful than a guess?', 'გაკვეთილში M3 F80 ჩანს. რომელი დეტალები ხდის ამ ამოცნობას ვარაუდზე უკეთესს?', 'В уроке показан M3 F80. Какие детали превращают узнавание в обоснованный ответ?'),
    text('Use the four-door sedan shape, broad arches and horizontal grille together. The sourced example links this F80 M3 configuration to S55.', 'ერთად გამოიყენე ოთხკარიანი სედანის ფორმა, ფართო თაღები და ჰორიზონტალური ცხაური. წყარო ამ F80 M3 კონფიგურაციას S55-ს უკავშირებს.', 'Сопоставьте четырёхдверный кузов, широкие арки и горизонтальную решётку. Источник связывает эту конфигурацию F80 M3 с S55.'),
    text('Describe the photographed body before naming the engine. Then explain which evidence supports S55: the visible grille alone or the documented M3 F80 configuration?', 'ძრავის დასახელებამდე ფოტოზე ძარა აღწერე. შემდეგ ახსენი, რომელი მტკიცებულება ამყარებს S55-ს: მხოლოდ ხილული ცხაური თუ დოკუმენტირებული M3 F80 კონფიგურაცია?', 'Перед названием двигателя опишите кузов на фото. Затем объясните, что подтверждает S55: одна решётка или документация конфигурации M3 F80?'),
    text('The visual cues support identifying the pictured car. Its exact documented configuration supports S55; the exterior appearance alone does not establish every production or market variant.', 'ვიზუალური ნიშნები ფოტოზე მანქანის ამოცნობას ამყარებს. მისი ზუსტი დოკუმენტირებული კონფიგურაცია S55-ს ადასტურებს; გარეგნობა წარმოების ან ბაზრის ყველა ვარიანტს ვერ ადგენს.', 'Внешние признаки помогают узнать машину на фото. S55 подтверждает её точная документированная конфигурация; внешний вид не определяет все производственные и рыночные варианты.'),
    text('Name several visible clues before choosing.', 'არჩევანამდე რამდენიმე ხილული ნიშანი დაასახელე.', 'Перед выбором назовите несколько видимых признаков.'),
    text('Use configuration records to establish the engine.', 'ძრავის დასადგენად კონფიგურაციის ჩანაწერები გამოიყენე.', 'Определяйте двигатель по документации конфигурации.')
  ),
  'model-g80': coaching(
    text('A tall grille is a strong cue. What else should you inspect before calling this car an M3?', 'მაღალი ცხაური ძლიერი მინიშნებაა. კიდევ რას უნდა დააკვირდე, სანამ მანქანას M3-ს უწოდებ?', 'Высокая решётка — сильная подсказка. Что ещё осмотреть перед ответом «M3»?'),
    text('Combine the tall vertical grille with the four-door sedan body. This documented G80 M3 Competition configuration uses the S58 family.', 'მაღალ ვერტიკალურ ცხაურს ოთხკარიანი სედანის ძარა შეუთავსე. ეს დოკუმენტირებული G80 M3 Competition კონფიგურაცია S58 ოჯახს იყენებს.', 'Сопоставьте высокую вертикальную решётку и четырёхдверный седан. Эта документированная конфигурация G80 M3 Competition использует семейство S58.'),
    text('You notice the vertical grille first. What body clue should you check next, and what separate source information supports the engine-family answer in this lesson?', 'პირველად ვერტიკალური ცხაური შენიშნე. ძარის რომელი ნიშანი უნდა შეამოწმო შემდეგ და წყაროს რომელი ცალკე ინფორმაცია ამყარებს ამ გაკვეთილში ძრავის ოჯახის პასუხს?', 'Сначала вы заметили вертикальную решётку. Какой признак кузова проверить дальше и какие отдельные сведения источника подтверждают семейство двигателя?'),
    text('Check the four-door sedan body as well as the front. The linked 2021 US M3 Competition launch configuration establishes S58; one styling feature alone cannot supply that application detail.', 'წინა ნაწილთან ერთად ოთხკარიანი სედანის ძარა შეამოწმე. მითითებული 2021 წლის აშშ-ის M3 Competition-ის საწყისი კონფიგურაცია S58-ს ადგენს; ერთი დიზაინის ნიშანი გამოყენების ამ მონაცემს ვერ იძლევა.', 'Проверьте четырёхдверный кузов вместе с передней частью. S58 подтверждает указанная стартовая конфигурация M3 Competition 2021 года для США; один признак дизайна этого не устанавливает.'),
    text('Use body shape alongside the grille.', 'ცხაურთან ერთად ძარის ფორმაც გამოიყენე.', 'Учитывайте кузов вместе с решёткой.'),
    text('Keep market and configuration with the engine claim.', 'ძრავის მონაცემს ბაზარი და კონფიგურაცია დაურთე.', 'Сохраняйте рынок и конфигурацию рядом с данными двигателя.')
  ),
  'model-f10-m5': coaching(
    text('Recognizing an F10 generation is one step. What establishes that this example is specifically an M5?', 'F10 თაობის ამოცნობა ერთი ნაბიჯია. რა ადგენს, რომ ეს მაგალითი კონკრეტულად M5-ია?', 'Узнать поколение F10 — один шаг. Что подтверждает, что этот пример именно M5?'),
    text('Read the larger sedan proportions, front air intakes and horizontal grille together with the photo identity and exact M5 source.', 'დიდი სედანის პროპორციები, წინა ჰაერმიმღებები და ჰორიზონტალური ცხაური ფოტოს იდენტობასა და M5-ის ზუსტ წყაროსთან ერთად შეაფასე.', 'Сопоставьте пропорции крупного седана, передние воздухозаборники и горизонтальную решётку с подписью фото и точным источником M5.'),
    text('The source documents an F10 M5 using S63. Another listing says only “5 Series F10.” Can you transfer the engine answer to that listing without further details?', 'წყარო S63-იან F10 M5-ს აღწერს. სხვა განცხადებაში მხოლოდ „5 Series F10“ წერია. დამატებითი მონაცემების გარეშე შეგიძლია მასაც იგივე ძრავა მიაკუთვნო?', 'Источник описывает F10 M5 с S63. В другом объявлении указано только «5 Series F10». Можно ли перенести на него ответ о двигателе без уточнений?'),
    text('No. The documented M5 example supports S63 for that configuration. A generation can include other models and applications, so identify the exact model, year and market first.', 'არა. დოკუმენტირებული M5 მაგალითი S63-ს სწორედ ამ კონფიგურაციისთვის ამყარებს. თაობა სხვა მოდელებსა და გამოყენებებსაც მოიცავს, ამიტომ ჯერ ზუსტი მოდელი, წელი და ბაზარი დაადგინე.', 'Нет. Пример M5 подтверждает S63 для этой конфигурации. Поколение включает другие модели и применения, поэтому сначала уточните модель, год и рынок.'),
    text('Separate the generation from the exact model.', 'გაარჩიე თაობა და ზუსტი მოდელი.', 'Различайте поколение и точную модель.'),
    text('Tie S63 to the sourced M5 configuration.', 'S63 წყაროში მოცემულ M5 კონფიგურაციას დაუკავშირე.', 'Связывайте S63 с документированной конфигурацией M5.')
  )
});

Object.assign(guides, {
  'engine-n54': coaching(
    text('Inline six describes the cylinders. What extra information tells you the turbo count?', 'რიგითი ექვსცილინდრიანი განლაგება ცილინდრებს აღწერს. რომელი დამატებითი ინფორმაცია გეუბნება ტურბოების რაოდენობას?', 'Рядная шестёрка описывает цилиндры. Какие дополнительные сведения определяют число турбин?'),
    text('The documented 335is example uses the N54 inline-six family with two turbochargers. Cylinder layout and turbo count are separate descriptions.', 'დოკუმენტირებული 335is მაგალითი N54 რიგით ექვსცილინდრიან ოჯახს ორი ტურბოკომპრესორით იყენებს. ცილინდრების განლაგება და ტურბოების რაოდენობა ცალკე აღწერებია.', 'Документированный 335is использует рядное шестицилиндровое семейство N54 с двумя турбокомпрессорами. Компоновка цилиндров и число турбин — разные характеристики.'),
    text('Compare the lesson’s N54 335is with its N55 example. Both are inline sixes; which statement from their documentation actually separates their turbo arrangements?', 'შეადარე გაკვეთილის N54 335is და N55 მაგალითი. ორივე რიგითი ექვსცილინდრიანია; დოკუმენტაციის რომელი მონაცემი განასხვავებს მათ ტურბომოწყობას?', 'Сравните N54 в 335is с примером N55 из урока. Оба рядные шестицилиндровые; какое указание документации различает их турбосхемы?'),
    text('The N54 example has two turbochargers; the N55 example has one twin-scroll unit. The shared cylinder arrangement does not make their turbo hardware identical.', 'N54 მაგალითს ორი ტურბოკომპრესორი აქვს; N55 მაგალითს — ერთი ორსადინრიანი ერთეული. საერთო ცილინდრული განლაგება ტურბომოწყობილობას იდენტურს არ ხდის.', 'У примера N54 два турбокомпрессора, у N55 — один двухпоточный. Общая компоновка цилиндров не означает одинаковое устройство наддува.'),
    text('Keep cylinder arrangement separate from turbo count.', 'ცილინდრების განლაგება ტურბოების რაოდენობისგან გაარჩიე.', 'Различайте компоновку цилиндров и число турбин.'),
    text('Remember the sourced N54 application: 335is.', 'დაიმახსოვრე N54-ის წყაროთი გამყარებული გამოყენება: 335is.', 'Запомните подтверждённое применение N54: 335is.')
  ),
  'engine-n55': coaching(
    text('“Twin-scroll” includes “twin.” Does that word mean there are two turbocharger units?', '„Twin-scroll“ სიტყვა „twin“-ს შეიცავს. ნიშნავს ეს, რომ ორი ტურბოკომპრესორია?', 'В названии twin-scroll есть слово twin. Означает ли оно два турбокомпрессора?'),
    text('The 2011 135i example documents one twin-scroll turbocharger on the N55 inline six. Scroll arrangement and turbo count answer different questions.', '2011 წლის 135i მაგალითი N55 რიგით ექვსცილინდრიანზე ერთ ორსადინრიან ტურბოკომპრესორს აღწერს. სადინრების მოწყობა და ტურბოების რაოდენობა სხვადასხვა კითხვას პასუხობს.', 'В примере 135i 2011 года у рядного N55 указан один двухпоточный турбокомпрессор. Устройство каналов и число агрегатов отвечают на разные вопросы.'),
    text('Read “one twin-scroll turbocharger” as two separate facts. How many complete units are documented, and what does the remaining phrase describe about that unit?', '„ერთი ორსადინრიანი ტურბოკომპრესორი“ ორ ფაქტად წაიკითხე. რამდენი სრული ერთეულია აღწერილი და რას აღწერს დარჩენილი ფრაზა ამ ერთეულში?', 'Разберите «один двухпоточный турбокомпрессор» на два факта. Сколько полных агрегатов указано и что описывает оставшаяся часть фразы?'),
    text('There is one turbocharger. Twin-scroll describes separated turbine-inlet passages within that arrangement. The word does not turn one documented unit into two.', 'არის ერთი ტურბოკომპრესორი. „ორსადინრიანი“ ამ მოწყობაში ტურბინის განცალკევებულ შემშვებ არხებს აღწერს. სიტყვა ერთ დოკუმენტირებულ ერთეულს ორად არ აქცევს.', 'Турбокомпрессор один. Двухпоточная схема описывает разделённые входные каналы турбины. Это слово не превращает один документированный агрегат в два.'),
    text('Count complete turbo units before reading the inlet type.', 'შესასვლელის ტიპამდე სრული ტურბოერთეულები დაითვალე.', 'Сначала считайте агрегаты, затем читайте тип входных каналов.'),
    text('Attach this N55 description to the 2011 135i example.', 'N55-ის ეს აღწერა 2011 წლის 135i მაგალითს დაუკავშირე.', 'Связывайте это описание N55 с примером 135i 2011 года.')
  ),
  'engine-b58': coaching(
    text('One family appears in both a 340i and a 740i. What is shared, and what still needs checking?', 'ერთი ოჯახი 340i-შიც გვხვდება და 740i-შიც. რა აქვთ საერთო და რა რჩება შესამოწმებელი?', 'Одно семейство встречается в 340i и 740i. Что общее, а что ещё требует проверки?'),
    text('The source documents the B58 inline-six family in the 2016 340i and 740i. A shared family name does not establish identical installation details.', 'წყარო B58 რიგით ექვსცილინდრიან ოჯახს 2016 წლის 340i-სა და 740i-ში აღწერს. ოჯახის საერთო სახელი მონტაჟის იდენტურ დეტალებს არ ადგენს.', 'Источник подтверждает рядное шестицилиндровое семейство B58 в 340i и 740i 2016 года. Общее имя не доказывает идентичность установки.'),
    text('Two component listings both mention B58, but only one identifies the exact vehicle and production application. Which listing gives you stronger evidence for a particular car, and why?', 'კომპონენტის ორივე განცხადება B58-ს ახსენებს, მაგრამ მხოლოდ ერთი ასახელებს ზუსტ მანქანასა და წარმოების გამოყენებას. რომელი იძლევა უფრო ძლიერ მტკიცებულებას კონკრეტული მანქანისთვის და რატომ?', 'Два объявления деталей упоминают B58, но только одно указывает точный автомобиль и производственное применение. Какое даёт более сильное основание для конкретной машины и почему?'),
    text('The listing matched to the exact application provides more relevant evidence. The family is a starting category; variant and production details narrow it to the vehicle being considered.', 'ზუსტ გამოყენებასთან შეჯერებული განცხადება უფრო შესაბამის მტკიცებულებას იძლევა. ოჯახი საწყისი კატეგორიაა; მოდიფიკაცია და წარმოების მონაცემები მას კონკრეტულ მანქანამდე ავიწროებს.', 'Объявление с точным применением даёт более подходящие данные. Семейство — начальная категория; модификация и производственные сведения уточняют её до нужного автомобиля.'),
    text('Recall both sourced 2016 applications: 340i and 740i.', 'გაიხსენე 2016 წლის ორივე დადასტურებული გამოყენება: 340i და 740i.', 'Помните оба подтверждённых применения 2016 года: 340i и 740i.'),
    text('Carry variant and application beyond the family code.', 'ოჯახის კოდს მოდიფიკაცია და გამოყენებაც დაურთე.', 'Дополняйте код семейства модификацией и применением.')
  ),
  'engine-s63': coaching(
    text('A V8 layout and two twin-scroll turbos describe different parts of the same engine. Can you separate them?', 'V8 განლაგება და ორი ორსადინრიანი ტურბო ერთი ძრავის სხვადასხვა ნაწილს აღწერს. შეგიძლია მათი გამიჯვნა?', 'V8 и два двухпоточных турбокомпрессора описывают разные стороны двигателя. Сможете их разделить?'),
    text('The F10 M5 example connects S63 to a V8 with two turbochargers. V8 describes eight cylinders in two banks; turbo details describe the boost system.', 'F10 M5 მაგალითი S63-ს ორი ტურბოკომპრესორის მქონე V8-ს უკავშირებს. V8 რვა ცილინდრს ორ რიგად აღწერს; ტურბოს დეტალები კი ჩაბერვის სისტემას.', 'Пример F10 M5 связывает S63 с V8 и двумя турбокомпрессорами. V8 описывает восемь цилиндров в двух рядах, а сведения о турбинах — систему наддува.'),
    text('Sort these source descriptions into two groups: “V8” and “two twin-scroll turbochargers.” Which describes the cylinders, and which contains both a turbo count and an inlet description?', 'წყაროს ორი აღწერა გაარჩიე: „V8“ და „ორი ორსადინრიანი ტურბოკომპრესორი“. რომელი აღწერს ცილინდრებს და რომელი შეიცავს ტურბოების რაოდენობასა და შესასვლელის აღწერას?', 'Разделите описания «V8» и «два двухпоточных турбокомпрессора». Что описывает цилиндры, а что содержит число турбин и устройство входа?'),
    text('V8 describes the cylinder arrangement. Two gives the turbo count, while twin-scroll describes each unit’s inlet arrangement. Keep all of these tied to the sourced F10 M5 example.', 'V8 ცილინდრების განლაგებას აღწერს. „ორი“ ტურბოების რაოდენობაა, „ორსადინრიანი“ კი თითოეულის შესასვლელს აღწერს. ეს ყველაფერი წყაროში მოცემულ F10 M5 მაგალითს დაუკავშირე.', 'V8 — компоновка цилиндров. Два — число турбин, двухпоточный — устройство входа каждого агрегата. Сохраняйте связь всех этих данных с источником F10 M5.'),
    text('Read layout, turbo count and inlet type separately.', 'განლაგება, ტურბოების რაოდენობა და შესასვლელის ტიპი ცალ-ცალკე წაიკითხე.', 'Раздельно читайте компоновку, число турбин и тип входа.'),
    text('Use the exact application when comparing S63 variants.', 'S63 ვარიანტების შედარებისას ზუსტი გამოყენება გაითვალისწინე.', 'При сравнении вариантов S63 учитывайте точное применение.')
  ),
  'diagnosis-cooling-flow': coaching(
    text('Temperature improves when road airflow increases. Which changing condition deserves your attention?', 'ტემპერატურა უმჯობესდება, როცა გზის ჰაერის ნაკადი იზრდება. რომელი ცვალებადი პირობა იმსახურებს ყურადღებას?', 'Температура улучшается с ростом дорожного обдува. На какое изменение стоит обратить внимание?'),
    text('This simulation contrasts airflow while reporting normal coolant circulation. Use that contrast to narrow the system, then test the explanation against every clue.', 'ეს სიმულაცია ჰაერის ნაკადს ადარებს და სითხის ნორმალურ ცირკულაციას იუწყება. ამ სხვაობით სისტემა დაავიწროვე, შემდეგ ახსნა ყველა მინიშნებას შეუთანხმე.', 'Симуляция меняет обдув при заявленной нормальной циркуляции жидкости. Используйте различие для выбора системы и проверьте версию по всем данным.'),
    text('The simulated fan is stationary when airflow is requested. What comparison would help distinguish a missing command or supply from a fan that does not respond?', 'სიმულირებული ვენტილატორი ჰაერის მოთხოვნისას უძრავია. რომელი შედარება დაეხმარება დაკარგული ბრძანების ან კვების გარჩევას ვენტილატორისგან, რომელიც ვერ რეაგირებს?', 'В симуляции вентилятор стоит при запросе обдува. Какое сравнение поможет отличить отсутствие команды или питания от вентилятора, который не отвечает?'),
    text('Compare fan command, electrical supply and actual rotation. These separate request, available energy and response; temperature alone cannot identify which of those stages failed.', 'შეადარე ვენტილატორის ბრძანება, ელექტრული კვება და რეალური ბრუნვა. ეს მოთხოვნას, ხელმისაწვდომ ენერგიასა და რეაქციას არჩევს; მხოლოდ ტემპერატურა ვერცერთ ეტაპს ვერ ასახელებს.', 'Сопоставьте команду, питание и фактическое вращение. Это разделяет запрос, доступную энергию и отклик; одна температура не определяет, какой этап нарушен.'),
    text('Use the standstill-versus-airflow contrast.', 'გამოიყენე გაჩერებისა და ჰაერის ნაკადის სხვაობა.', 'Учитывайте различие между стоянкой и дорожным обдувом.'),
    text('Revise the explanation when new evidence appears.', 'ახალი მტკიცებულებისას ახსნა გადახედე.', 'Пересматривайте объяснение при новых данных.')
  ),
  'diagnosis-boost-path': coaching(
    text('Low pressure is a symptom. What does a visible gap add to the explanation?', 'დაბალი წნევა სიმპტომია. რას ამატებს ხილული ღრეჩო ახსნას?', 'Низкое давление — симптом. Что добавляет к объяснению видимый разрыв трубки?'),
    text('A gap after the compressor is direct evidence about the compressed-air path. It narrows the simulation beyond the low-pressure reading alone.', 'კომპრესორის შემდეგ ღრეჩო შეკუმშული ჰაერის გზის პირდაპირი მტკიცებულებაა. ის სიმულაციას მხოლოდ დაბალი წნევის მაჩვენებელზე მეტად ავიწროებს.', 'Разрыв после компрессора — прямое свидетельство о тракте сжатого воздуха. Он сужает версию сильнее, чем одно показание низкого давления.'),
    text('In the simulator, air is seen escaping at the pipe gap under pressure. Is that more useful for the leak explanation than seeing the same low-boost warning a second time?', 'სიმულატორში წნევისას ჰაერი მილის ღრეჩოდან გამოდის. გაჟონვის ასახსნელად ეს უფრო სასარგებლოა, ვიდრე იმავე დაბალი ჩაბერვის გაფრთხილების მეორედ დანახვა?', 'В симуляторе видно, как воздух выходит из разрыва под давлением. Полезнее ли это для версии утечки, чем повтор того же предупреждения о низком наддуве?'),
    text('Yes. Escaping air adds an observation at the proposed cause; repeating the warning only repeats the symptom. If pressure stays low after the gap is closed, continue considering other causes.', 'დიახ. გამოსული ჰაერი სავარაუდო მიზეზთან დაკვირვებას ამატებს; გაფრთხილების გამეორება მხოლოდ სიმპტომს იმეორებს. თუ ღრეჩოს დახურვის შემდეგ წნევა დაბალია, სხვა მიზეზების განხილვა გააგრძელე.', 'Да. Выходящий воздух добавляет наблюдение в месте предполагаемой причины; повтор предупреждения повторяет лишь симптом. Если после закрытия разрыва давление низкое, рассматривайте другие причины.'),
    text('Separate a repeated symptom from new causal evidence.', 'განმეორებითი სიმპტომი ახალ მიზეზობრივ მტკიცებულებას გაარჩიე.', 'Отличайте повтор симптома от новых данных о причине.'),
    text('Allow more than one problem in the explanation.', 'ახსნაში ერთზე მეტი პრობლემის შესაძლებლობა დაუშვი.', 'Допускайте несколько проблем в одном объяснении.')
  ),
  'diagnosis-signal-plausibility': coaching(
    text('Three signals are smooth and one jumps wildly. What is supported before you name a failed part?', 'სამი სიგნალი თანაბარია, ერთი კი მკვეთრად ხტება. რა მყარდება დაზიანებული ნაწილის დასახელებამდე?', 'Три сигнала плавные, один резко скачет. Что подтверждено до выбора неисправной детали?'),
    text('Compare a signal with related measurements and the simulated motion. A plausibility problem identifies a signal path, not automatically one failed sensor.', 'სიგნალი დაკავშირებულ გაზომვებსა და სიმულირებულ მოძრაობას შეადარე. სარწმუნოობის პრობლემა სიგნალის გზას ავლენს და არა ავტომატურად ერთ დაზიანებულ სენსორს.', 'Сравнивайте сигнал со связанными измерениями и движением в симуляции. Неправдоподобие указывает на сигнальный тракт, а не автоматически на один неисправный датчик.'),
    text('One wheel-speed trace instantly jumps from zero to a very high value while the simulated car moves smoothly. Must the other three traces be exactly equal to make the comparison useful?', 'თვლის ერთი სიგნალი ნულიდან ძალიან მაღალ მნიშვნელობაზე მყისიერად ხტება, მანქანა კი თანაბრად მოძრაობს. შედარების სასარგებლოდ აუცილებელია დანარჩენი სამი სიგნალის ზუსტი ტოლობა?', 'Один сигнал колеса мгновенно прыгает от нуля к огромному значению при плавном движении. Обязаны ли остальные три совпадать точно, чтобы сравнение было полезным?'),
    text('No. Wheel speeds can differ in a corner; the useful clue is the isolated implausible jump against the motion context. Sensor, connection, supply and processing still need to be distinguished.', 'არა. მოსახვევში თვლების სიჩქარე შეიძლება განსხვავდებოდეს; სასარგებლო მინიშნება მოძრაობის კონტექსტში იზოლირებული არასარწმუნო ნახტომია. სენსორი, შეერთება, კვება და დამუშავება ჯერ გასარჩევია.', 'Нет. В повороте обороты колёс могут различаться; важен отдельный неправдоподобный скачок на фоне движения. Датчик, соединение, питание и обработку ещё предстоит различить.'),
    text('Compare plausibility in context, not exact equality.', 'კონტექსტში სარწმუნოობა შეადარე და არა ზუსტი ტოლობა.', 'Сравнивайте правдоподобие в контексте, а не точное равенство.'),
    text('Name only the conclusion the clues establish.', 'მხოლოდ ის დასკვნა დაასახელე, რასაც მინიშნებები ადგენს.', 'Называйте только вывод, подтверждённый данными.')
  ),
  'm-models': coaching(
    text('Before looking at the answer choices, what does the complete body shape tell you?', 'პასუხების ნახვამდე რას გეუბნება ძარის მთლიანი ფორმა?', 'Что говорит форма кузова целиком до просмотра вариантов ответа?'),
    text('Begin with doors, roofline and proportions, then add grille and light cues. Recognition is stronger when several visible features support the same answer.', 'დაიწყე კარებით, სახურავის ხაზითა და პროპორციებით, შემდეგ ცხაური და ფარები დაამატე. ამოცნობა მყარია, როცა ერთ პასუხს რამდენიმე ხილული ნიშანი ამყარებს.', 'Начните с дверей, крыши и пропорций, затем добавьте решётку и фары. Узнавание надёжнее, когда несколько видимых признаков поддерживают ответ.'),
    text('Compare the round’s F80 M3 and F82 M4 examples. Both have low horizontal kidney grilles. Which body details help separate them when the grille alone is similar?', 'შეადარე რაუნდის F80 M3 და F82 M4 მაგალითები. ორივეს დაბალი ჰორიზონტალური ცხაური აქვს. ძარის რომელი დეტალები არჩევს მათ, როცა მხოლოდ ცხაური მსგავსია?', 'Сравните F80 M3 и F82 M4 из раунда. У обоих низкие горизонтальные решётки. Какие признаки кузова различают их, если одной решётки недостаточно?'),
    text('The pictured F80 M3 is a four-door sedan; the F82 M4 has two long doors and a sloping coupé roof. Use the whole car, then review the named photograph and its source after answering.', 'ფოტოზე F80 M3 ოთხკარიანი სედანია; F82 M4-ს ორი გრძელი კარი და დაქანებული კუპეს სახურავი აქვს. მთელი მანქანა გამოიყენე, შემდეგ პასუხის შემდეგ ფოტოს დასახელება და წყარო ნახე.', 'На фото F80 M3 — четырёхдверный седан, F82 M4 — с двумя длинными дверями и покатой крышей купе. Смотрите на весь автомобиль, затем изучите подпись и источник после ответа.'),
    text('Start broad, then use smaller styling clues.', 'დაიწყე მთლიანი ფორმით, შემდეგ მცირე ნიშნები გამოიყენე.', 'Начинайте с общей формы, затем уточняйте детали.'),
    text('Give a visual reason for the model you choose.', 'არჩეულ მოდელს ვიზუალური მიზეზი დაურთე.', 'Обоснуйте выбор модели видимыми признаками.')
  ),
  'm-generations': coaching(
    text('The model family stays the same. Which features help you notice that the generation changed?', 'მოდელის ოჯახი იგივეა. რომელი ნიშნები გეხმარება თაობის ცვლილების შემჩნევაში?', 'Семейство модели то же. Какие признаки помогают заметить смену поколения?'),
    text('For generation questions, keep the named model fixed and compare its body, grille and light shapes across the pictured examples.', 'თაობის კითხვაში დასახელებული მოდელი უცვლელად მიიღე და ფოტოებზე მისი ძარა, ცხაური და ფარების ფორმები შეადარე.', 'В вопросе о поколении держите названную модель постоянной и сравнивайте кузов, решётку и фары показанных примеров.'),
    text('The round shows an F80 M3 and a G80 M3, both with four-door sedan bodies. Which front-end cue from the lesson helps distinguish these two photographed generations?', 'რაუნდში F80 M3 და G80 M3 ჩანს, ორივე ოთხკარიანი სედანია. გაკვეთილის წინა ნაწილის რომელი ნიშანი არჩევს ფოტოზე ამ ორ თაობას?', 'В раунде есть F80 M3 и G80 M3, оба четырёхдверные седаны. Какой признак передней части из урока различает эти поколения на фото?'),
      text('The F80 has lower horizontal kidney grilles; the G80 has very tall vertical grilles. Keep the sedan body in view too, so a striking grille does not replace the complete comparison.', 'F80-ს დაბალი ჰორიზონტალური ცხაური აქვს; G80-ს — ძალიან მაღალი ვერტიკალური. სედანის ძარაც გაითვალისწინე, რათა თვალშისაცემმა ცხაურმა სრული შედარება არ ჩაანაცვლოს.', 'У F80 низкие горизонтальные решётки, у G80 — очень высокие вертикальные. Учитывайте и кузов седана, чтобы яркая решётка не заменила полное сравнение.'),
    text('Keep model identity separate from the generation code.', 'მოდელის იდენტობა თაობის კოდისგან გაარჩიე.', 'Различайте модель и код поколения.'),
    text('Compare the same set of cues between photographs.', 'ფოტოებს შორის ერთი და იგივე ნიშნები შეადარე.', 'Сопоставляйте один и тот же набор признаков на фото.')
  ),
  'm-mixed': coaching(
    text('Do you need to name the model or the generation? Read that distinction before inspecting the photo.', 'მოდელი უნდა დაასახელო თუ თაობა? ფოტოს დათვალიერებამდე ეს განსხვავება წაიკითხე.', 'Нужна модель или поколение? Уточните это до изучения фотографии.'),
    text('A mixed round changes the kind of answer requested. Model names and generation codes describe different levels of the photographed car’s identity.', 'შერეულ რაუნდში მოთხოვნილი პასუხის ტიპი იცვლება. მოდელის სახელები და თაობის კოდები ფოტოზე მანქანის იდენტობის სხვადასხვა დონეს აღწერს.', 'В смешанном раунде меняется тип ответа. Название модели и код поколения описывают разные уровни идентификации машины.'),
    text('You identify a pictured car as an M3 from the G80 generation. If the prompt asks “which model,” what form should your answer take? What changes if it asks “which generation”?', 'ფოტოზე მანქანას G80 თაობის M3-ად ამოიცნობ. თუ კითხვა მოდელს გეკითხება, რა ფორმის პასუხი უნდა მისცე? რა იცვლება, თუ თაობას გეკითხება?', 'Вы узнали на фото M3 поколения G80. В какой форме ответить на вопрос «какая модель»? Что меняется, если спрашивают поколение?'),
    text('Use M3 for a model question and G80 for a generation question. The same visual identification can support both, but the prompt determines which part of it is being tested.', 'მოდელის კითხვაზე გამოიყენე M3, თაობის კითხვაზე — G80. იგივე ვიზუალური ამოცნობა ორივეს შეიძლება ამყარებდეს, მაგრამ კითხვა განსაზღვრავს, რომელი ნაწილი მოწმდება.', 'В вопросе о модели ответ — M3, о поколении — G80. Одно узнавание может подтвердить оба, но формулировка определяет, какую часть проверяют.'),
    text('Identify the requested answer type first.', 'ჯერ მოთხოვნილი პასუხის ტიპი დაადგინე.', 'Сначала определите требуемый тип ответа.'),
    text('Use the explanation to refine one visual distinction.', 'განმარტებით ერთი ვიზუალური განსხვავება დააზუსტე.', 'Уточняйте одно визуальное различие по объяснению.')
  ),
  'puzzle-sequences': coaching(
    text('A sequence should tell a story. Is this one a repeating cycle or a path with a start and finish?', 'თანმიმდევრობა ისტორიას უნდა ჰყვებოდეს. ეს განმეორებადი ციკლია თუ დასაწყისისა და დასასრულის მქონე გზა?', 'Последовательность рассказывает историю. Это повторяющийся цикл или путь с началом и концом?'),
    text('Use the prompt to identify what is being ordered: the four-stroke cycle, conversion to rotation or the drive path toward the wheels.', 'კითხვით დაადგინე, რას ალაგებ: ოთხტაქტიან ციკლს, ბრუნვად გარდაქმნას თუ თვლებისკენ ამძრავის გზას.', 'По вопросу определите, что упорядочивается: четырёхтактный цикл, превращение во вращение или путь тяги к колёсам.'),
    text('For an engine-to-wheel path, choose the starting component and then ask what receives its output. How does this method place the transmission relative to the engine and differential?', 'ძრავიდან თვლამდე გზისთვის აირჩიე საწყისი კომპონენტი, შემდეგ იკითხე, რა იღებს მის გამოსავალს. როგორ ათავსებს ეს მეთოდი კოლოფს ძრავასა და დიფერენციალთან მიმართებით?', 'Для пути от двигателя к колёсам выберите начало и спросите, кто получает его выход. Где этот способ помещает коробку относительно двигателя и дифференциала?'),
    text('Engine output goes to the transmission, then toward the differential and driven wheels. Test each neighboring pair as a connection instead of remembering only the position of a card.', 'ძრავის გამოსავალი კოლოფში მიდის, შემდეგ დიფერენციალისა და წამყვანი თვლებისკენ. თითოეული მეზობელი წყვილი კავშირად შეამოწმე და მხოლოდ ბარათის ადგილი არ დაიმახსოვრო.', 'Выход двигателя идёт в коробку, затем к дифференциалу и ведущим колёсам. Проверяйте каждую соседнюю пару как связь, а не запоминайте только место карточки.'),
    text('Choose an anchor, then explain each next step.', 'აირჩიე საწყისი წერტილი, შემდეგ ყოველი ნაბიჯი ახსენი.', 'Выберите опорный шаг и объясняйте каждый следующий.'),
    text('Use undo to revise a connection before checking.', 'შემოწმებამდე კავშირის შესაცვლელად გაუქმება გამოიყენე.', 'Используйте отмену, чтобы изменить связь до проверки.')
  ),
  'puzzle-connections': coaching(
    text('A term can match a meaning, a unit or a job. Which kind of relationship does this prompt request?', 'ტერმინი მნიშვნელობას, ერთეულს ან სამუშაოს შეიძლება ეწყვილებოდეს. რომელ კავშირს ითხოვს ეს კითხვა?', 'Термину может соответствовать смысл, единица или задача. Какой вид связи нужен в этом вопросе?'),
    text('Match by meaning rather than card position. First distinguish quantities and units from components and their jobs.', 'შეუწყვილე მნიშვნელობით და არა ბარათის ადგილით. ჯერ სიდიდეები და ერთეულები კომპონენტებისა და მათი სამუშაოებისგან გაარჩიე.', 'Сопоставляйте по смыслу, а не по месту карточки. Сначала отличайте величины и единицы от компонентов и их задач.'),
    text('You see power, torque and rotational speed on one side, and kW, Nm and RPM on the other. Say what each quantity means before deciding which unit belongs with it.', 'ერთ მხარეს ხედავ სიმძლავრეს, მომენტსა და ბრუნვის სიხშირეს, მეორეზე — kW, Nm და RPM. დაწყვილებამდე თქვი, რას ნიშნავს თითოეული სიდიდე.', 'С одной стороны мощность, момент и обороты, с другой — kW, Nm и RPM. Перед сопоставлением объясните смысл каждой величины.'),
    text('Power is rate of work and pairs with kW; torque is turning effect and pairs with Nm; rotational speed pairs with RPM. The meaning gives a reason for each match that survives a different card order.', 'სიმძლავრე მუშაობის სიჩქარეა და kW-ს ეწყვილება; მომენტი მაბრუნებელი ეფექტია და Nm-ს ეწყვილება; ბრუნვის სიხშირე — RPM-ს. მნიშვნელობა ბარათების რიგის შეცვლისასაც დაწყვილების მიზეზს გაძლევს.', 'Мощность — скорость работы, ей соответствует kW; момент — вращающее действие, ему соответствует Nm; оборотам — RPM. Смысл обосновывает пару при любом порядке карточек.'),
    text('Identify the relationship before making a pair.', 'დაწყვილებამდე კავშირის ტიპი დაადგინე.', 'Перед парой определите тип связи.'),
    text('Explain each pair in one short sentence.', 'თითოეული წყვილი ერთი მოკლე წინადადებით ახსენი.', 'Объясните каждую пару одним коротким предложением.')
  ),
  'puzzle-parts': coaching(
    text('Look at the whole photographed object. Which visible feature connects its shape to a known job?', 'ფოტოზე ობიექტს მთლიანად დააკვირდი. რომელი ხილული ნიშანი აკავშირებს ფორმას ცნობილ დანიშნულებასთან?', 'Рассмотрите предмет целиком. Какой видимый признак связывает его форму с известной задачей?'),
    text('Compare shape, openings and functional details with the components you studied. Use the answer explanation to check the name and purpose together.', 'ფორმა, ღიობები და ფუნქციური დეტალები შესწავლილ კომპონენტებს შეადარე. პასუხის განმარტებით სახელი და დანიშნულება ერთად შეამოწმე.', 'Сопоставьте форму, отверстия и рабочие детали с изученными компонентами. По объяснению проверяйте название вместе с назначением.'),
    text('Compare two familiar clues from the parts lessons: pleated filtering material and an electrode gap. Which suggests filtering intake air, and which suggests starting combustion with a spark?', 'ნაწილების გაკვეთილებიდან ორი ნიშანი შეადარე: ნაკეცებიანი საფილტრი მასალა და ელექტროდების ღრეჩო. რომელი მიანიშნებს ჰაერის გაფილტვრაზე და რომელი — ნაპერწკლით წვის დაწყებაზე?', 'Сравните две знакомые детали: складчатый фильтрующий материал и электродный зазор. Что указывает на фильтрацию впуска, а что — на начало горения искрой?'),
    text('The pleated material belongs to the air-filter function; the electrode gap belongs to the spark-plug function. Link the visible feature to the job, then verify the full photo identity after checking.', 'ნაკეცებიანი მასალა ჰაერის ფილტრის ფუნქციას უკავშირდება; ელექტროდების ღრეჩო — სანთლისას. ხილული ნიშანი სამუშაოს დაუკავშირე, შემდეგ შემოწმების შემდეგ ფოტოს სრული იდენტობა გადაამოწმე.', 'Складчатый материал связан с функцией воздушного фильтра, электродный зазор — свечи. Свяжите признак с задачей, затем после проверки изучите полную подпись фотографии.'),
    text('Use a visible feature and a functional reason.', 'გამოიყენე ხილული ნიშანი და ფუნქციური მიზეზი.', 'Используйте видимый признак и объяснение функции.'),
    text('Check the revealed name and purpose after answering.', 'პასუხის შემდეგ გახსნილი სახელი და დანიშნულება შეამოწმე.', 'После ответа проверьте открывшиеся название и назначение.')
  )
});

// Accept IDs or curriculum objects, so both chapter and player views use one API.
// Unknown/dynamic lessons retain their existing teaching panel rather than filler.
export const learningTrackIds = Object.freeze(Object.keys(tracks));
export const learningGuideIds = Object.freeze(Object.keys(guides));
export function learningTrack(unitOrId) {
  const id = typeof unitOrId === 'string' ? unitOrId : unitOrId?.id;
  return Object.hasOwn(tracks, id) ? tracks[id] : null;
}
export function lessonGuide(lessonOrId) {
  const id = typeof lessonOrId === 'string' ? lessonOrId : lessonOrId?.id;
  return Object.hasOwn(guides, id) ? guides[id] : null;
}
