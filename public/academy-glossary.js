// Original educational definitions. Primary references are attached to each term.
// Model examples refer to specific configurations already documented in catalog.js.
const source=(label,url)=>Object.freeze({label,url});
const references={
  bmwValve:source('BMW · variable cam timing and valve lift','https://www.press.bmwgroup.com/usa/article/detail/T0136050EN_US/the-new-bmw-320i-sedan'),
  bmwM5:source('BMW · F10 M5 engine and drivetrain','https://www.press.bmwgroup.com/canada/article/detail/T0114793EN/the-all-new-bmw-m5?language=en'),
  bmwCS:source('BMW · M3 CS and M xDrive','https://www.press.bmwgroup.com/global/article/detail/T0407668EN/the-all-new-bmw-m3-cs'),
  combustion:source('U.S. Department of Energy · combustion basics','https://www.energy.gov/cmei/vehicles/articles/internal-combustion-engine-basics'),
  bearings:source('Motorservice · engine bearing fundamentals (PDF)','https://www.ms-motorservice.com/MediaAssets/2054034_ks_50003859-02_web.pdf'),
  turbo:source('Garrett · turbocharger basics','https://www.garrettmotion.com/de/turbocharger-technology/how-a-turbo-works/basic/'),
  wastegate:source('Garrett · wastegate and blow-off valve functions','https://www.garrettmotion.com/knowledge-center-category/racing-and-performance/what-is-the-difference-between-a-wastegate-and-a-blow-off-valve/'),
  cooling:source('Garrett · charge-air cooling','https://www.garrettmotion.com/racing-and-performance/choosing-a-turbocharger/turbo-system-optimization/'),
  power:source('NASA · power and work','https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/power/'),
  units:source('NIST · mechanical and metric horsepower','https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9'),
  torque:source('NASA · torque and rotation','https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/torque-moment/'),
  dct:source('ZF · dual-clutch operating principle (PDF)','https://www.zf.com/public/org/pkw_a_aktiveanfahrsysteme_2017_72036.pdf'),
  ecu:source('Bosch · engine control unit','https://www.bosch-mobility.com/en/solutions/control-units/engine-control-unit/'),
};
const text=(name,summary,detail)=>Object.freeze({name,summary,detail});
function term(id,category,aliases,related,lessonIds,modelIds,sources,en,ka,ru){
  return Object.freeze({id,category,aliases:Object.freeze(aliases),related:Object.freeze(related),lessonIds:Object.freeze(lessonIds),modelIds:Object.freeze(modelIds),sources:Object.freeze(sources),i18n:Object.freeze({en,ka,ru})});
}

export const glossaryEntries=Object.freeze([
  term('vanos','engine',['double vanos','variable camshaft timing','VVT'],['camshaft','valvetronic','ecu'],['engine-codes','combustion'],['f80','e92'],[references.bmwValve,references.bmwM5],
    text('VANOS','BMW’s system for adjusting camshaft timing relative to the crankshaft.','Changing cam timing changes when valves open and close. Double VANOS controls both intake and exhaust camshafts; it does not describe valve lift.'),
    text('VANOS','BMW-ის სისტემა, რომელიც მუხლა ლილვთან მიმართებით გამანაწილებელი ლილვის ფაზას ცვლის.','ფაზის შეცვლა სარქველების გახსნისა და დახურვის დროს ცვლის. Double VANOS ორივე გამანაწილებელ ლილვს მართავს; სარქვლის აწევის სიმაღლე სხვა პარამეტრია.'),
    text('VANOS','Система BMW, изменяющая фазы распредвала относительно коленчатого вала.','Изменение фаз сдвигает моменты открытия и закрытия клапанов. Double VANOS управляет впускным и выпускным распредвалами; высоту подъёма клапанов эта аббревиатура не обозначает.')),
  term('valvetronic','engine',['variable valve lift','valve lift'],['vanos','camshaft','ecu'],['engine-codes','combustion'],['f22','f80'],[references.bmwValve],
    text('Valvetronic','BMW’s variable intake-valve lift system for controlling engine airflow.','It changes how far intake valves open, helping reduce throttling losses. VANOS adjusts timing instead; equipped engines can use both systems together.'),
    text('Valvetronic','BMW-ის სისტემა, რომელიც შემშვები სარქველების აწევის სიმაღლით ჰაერის ნაკადს მართავს.','ცვლის, რამდენად გაიხსნება შემშვები სარქველი და ამცირებს დროსელირებით გამოწვეულ დანაკარგებს. VANOS გახსნის დროს ცვლის; ძრავში ორივე სისტემა შეიძლება მუშაობდეს.'),
    text('Valvetronic','Система BMW, управляющая воздухом через изменение подъёма впускных клапанов.','Меняет высоту открытия впускных клапанов и уменьшает потери на дросселирование. VANOS меняет фазы; обе системы могут работать в одном двигателе.')),
  term('xdrive','drivetrain',['xdrive','M xDrive','AWD','all wheel drive'],['differential','m-differential','torque'],['transmission','differential'],['g80-m3-cs'],[references.bmwCS],
    text('xDrive','BMW’s all-wheel-drive name: drive can reach both front and rear axles.','Its hardware and torque distribution vary by model. M xDrive is the M-specific version; an ordinary generation code alone does not establish all-wheel drive.'),
    text('xDrive','BMW-ის სრულამძრავიანი სისტემის სახელია: მომენტი წინა და უკანა ღერძებს მიეწოდება.','აგებულება და მომენტის განაწილება მოდელზეა დამოკიდებული. M xDrive M მოდელების ვერსიაა; მხოლოდ თაობის კოდი სრულ ამძრავს არ ადასტურებს.'),
    text('xDrive','Название полного привода BMW: тяга передаётся на переднюю и заднюю оси.','Конструкция и распределение момента зависят от модели. M xDrive — версия для M-моделей; один код поколения не подтверждает наличие полного привода.')),
  term('differential','drivetrain',['diff','final drive','დიფერენციალი','дифференциал'],['m-differential','torque','xdrive'],['differential','transmission'],['f10-m5'],[references.bmwM5],
    text('Differential','A drivetrain assembly that allows its two outputs to rotate at different speeds.','In a corner the outside driven wheel travels farther. A differential accommodates that speed difference while transmitting drive; open and limited-slip designs behave differently.'),
    text('დიფერენციალი','ტრანსმისიის მექანიზმი, რომელიც ორ გამოსასვლელს სხვადასხვა სიჩქარით ბრუნვის საშუალებას აძლევს.','მოსახვევში გარე წამყვანი თვალი მეტ მანძილს გადის. დიფერენციალი ამ განსხვავებას ამძრავის გადაცემისას ითვალისწინებს; ღია და შეზღუდული სრიალის ვერსიები განსხვავდება.'),
    text('Дифференциал','Узел трансмиссии, позволяющий двум выходам вращаться с разной скоростью.','В повороте наружное ведущее колесо проходит больший путь. Дифференциал допускает разницу скоростей, передавая тягу; открытая конструкция и самоблокирующаяся работают по-разному.')),
  term('crankshaft','engine',['crank','crank shaft','მუხლა ლილვი','ამწე ლილვი','коленвал'],['connecting-rod','rod-bearings','camshaft'],['combustion','first-engine'],['e92'],[references.combustion,references.bearings],
    text('Crankshaft','The shaft that receives piston force through connecting rods and produces rotation.','Offset crankpins turn the rods’ push and pull into torque. Main bearings support the crankshaft in the engine block; they are separate from connecting-rod bearings.'),
    text('მუხლა ლილვი','ლილვი, რომელიც დგუშების ძალას ბარბაცებით იღებს და ბრუნვით მოძრაობას ქმნის.','წანაცვლებულ ყელებზე მოქმედი ძალა მაბრუნებელ მომენტს წარმოქმნის. მუხლა ლილვს ბლოკში ძირითადი საკისრები იჭერს; ბარბაცას საკისრები სხვა ადგილას მუშაობს.'),
    text('Коленчатый вал','Вал, принимающий усилия поршней через шатуны и создающий вращение.','Смещённые шатунные шейки превращают усилие в крутящий момент. Коренные подшипники поддерживают коленвал в блоке; это не шатунные вкладыши.')),
  term('camshaft','engine',['cam','cam shaft','გამანაწილებელი ლილვი','распредвал'],['vanos','valvetronic','crankshaft'],['combustion','engine-codes'],['f80'],[references.bmwValve,references.combustion],
    text('Camshaft','A shaft with lobes that operate the engine’s valves through the valvetrain.','The timing drive synchronizes it with the crankshaft. In a conventional four-stroke engine, the camshaft turns once for every two crankshaft revolutions.'),
    text('გამანაწილებელი ლილვი','ლილვი, რომლის მუშტებიც სარქვლის მექანიზმის მეშვეობით სარქველებს ამოძრავებს.','გაზგამანაწილებელი ამძრავი მას მუხლა ლილვთან ათანხმებს. ჩვეულებრივ ოთხტაქტიან ძრავში მუხლა ლილვის ორ ბრუნზე გამანაწილებელი ლილვი ერთხელ ბრუნავს.'),
    text('Распределительный вал','Вал с кулачками, которые управляют клапанами через клапанный механизм.','Привод ГРМ синхронизирует его с коленвалом. В обычном четырёхтактном двигателе распредвал делает один оборот за два оборота коленвала.')),
  term('connecting-rod','engine',['conrod','con rod','rod','ბარბაცა','шатун'],['crankshaft','rod-bearings','torque'],['combustion','first-engine'],['e92'],[references.combustion,references.bearings],
    text('Connecting rod','The link that transfers force between a piston and the crankshaft.','Its small end connects to the piston pin; its big end runs around a crankpin. The rod moves back and forth while also changing angle.'),
    text('ბარბაცა','დეტალი, რომელიც დგუშსა და მუხლა ლილვს შორის ძალას გადასცემს.','პატარა თავი დგუშის თითს უერთდება, დიდი თავი კი მუხლა ლილვის ყელზე მუშაობს. მოძრაობისას ბარბაცა გადაადგილებასთან ერთად კუთხესაც იცვლის.'),
    text('Шатун','Деталь, передающая усилие между поршнем и коленчатым валом.','Малая головка соединяется с поршневым пальцем, большая охватывает шатунную шейку коленвала. При работе шатун одновременно перемещается и меняет наклон.')),
  term('rod-bearings','engine',['rod bearing','big end bearing','conrod bearings','ბარბაცას საკისრები','шатунные вкладыши'],['connecting-rod','crankshaft'],['combustion'],[],[references.bearings],
    text('Rod bearings','Bearing shells between a connecting rod’s big end and its crankshaft journal.','An oil film normally separates the loaded surfaces. Clearance, oil supply and condition matter; an engine-family name alone does not establish a failure or replacement interval.'),
    text('ბარბაცას საკისრები','საკისრის ჩანართები ბარბაცას დიდ თავსა და მუხლა ლილვის ყელს შორის.','დატვირთულ ზედაპირებს ჩვეულებრივ ზეთის ფენა აცალკევებს. ღრეჩო, ზეთის მიწოდება და მდგომარეობა მნიშვნელოვანია; ძრავის კოდი დაზიანებას ან შეცვლის ვადას თავისთავად არ ადგენს.'),
    text('Шатунные вкладыши','Вкладыши между большой головкой шатуна и шатунной шейкой коленвала.','Рабочие поверхности обычно разделяет масляная плёнка. Важны зазор и подача масла; название семейства двигателя само по себе не определяет неисправность или срок замены.')),
  term('intercooler','air',['charge air cooler','charge-air cooler','CAC','ინტერკულერი','интеркулер'],['turbocharger','boost','wastegate'],['turbocharging','cooling'],['f10-m5'],[references.cooling,references.bmwM5],
    text('Intercooler','A heat exchanger that cools compressed intake air before it enters the engine.','Compression heats the charge. Air-to-air and air-to-liquid coolers remove heat differently; the charge-air circuit is not necessarily the engine-coolant circuit.'),
    text('ინტერკულერი','თბომცვლელი, რომელიც შეკუმშულ შემშვებ ჰაერს ძრავში შესვლამდე აგრილებს.','შეკუმშვისას ჰაერი ცხელდება. გაგრილება შეიძლება ჰაერით ან სითხით ხდებოდეს; ინტერკულერისა და ძრავის გამაგრილებელი სითხის წრედები ყოველთვის ერთი არ არის.'),
    text('Интеркулер','Теплообменник, охлаждающий сжатый впускной воздух перед поступлением в двигатель.','При сжатии воздух нагревается. Охладители бывают воздушными и жидкостными; контур охлаждения наддувочного воздуха может отличаться от контура охлаждения двигателя.')),
  term('wastegate','air',['waste gate','boost control valve','ვეისტგეიტი','вестгейт'],['turbocharger','boost','intercooler'],['turbocharging'],[],[references.wastegate],
    text('Wastegate','A valve that bypasses exhaust around a turbocharger turbine to regulate its drive.','Opening it reduces the exhaust energy reaching the turbine and helps control boost. A blow-off or recirculation valve acts on the intake side instead.'),
    text('ვეისტგეიტი','სარქველი, რომელიც გამონაბოლქვის ნაწილს ტურბინის გვერდის ავლით ატარებს.','გახსნისას ტურბინაზე მიწოდებული ენერგია მცირდება და ჩაბერვის წნევის მართვა ხდება. Blow-off ან რეცირკულაციის სარქველი შემშვებ მხარეს მუშაობს.'),
    text('Вестгейт','Клапан, направляющий часть выхлопа в обход турбины турбокомпрессора.','При открытии уменьшается энергия, поступающая на турбину, что помогает регулировать наддув. Перепускной клапан blow-off работает на стороне впуска.')),
  term('boost','air',['boost pressure','manifold pressure','psi','bar','ჩაბერვა','наддув'],['turbocharger','wastegate','intercooler'],['turbocharging'],[],[references.turbo,references.wastegate],
    text('Boost pressure','Intake pressure above ambient atmospheric pressure, when expressed as gauge boost.','Absolute pressure also includes atmospheric pressure. Check the pressure reference and units before comparing figures; more boost alone does not establish power or reliability.'),
    text('ჩაბერვის წნევა','შემშვები ჰაერის წნევის ატმოსფერულზე მეტობა, როდესაც მანომეტრულ ჩაბერვას ვგულისხმობთ.','აბსოლუტური წნევა ატმოსფერულ წნევასაც მოიცავს. შედარებამდე გადაამოწმეთ ერთეული და ათვლის წერტილი; მეტი წნევა მარტო სიმძლავრესა და გამძლეობას არ განსაზღვრავს.'),
    text('Давление наддува','Превышение давления впуска над атмосферным, если речь об избыточном давлении.','Абсолютное давление включает и атмосферное. При сравнении проверяйте единицы и точку отсчёта; один рост наддува не определяет мощность или надёжность.')),
  term('horsepower','numbers',['hp','bhp','PS','power','ცხენის ძალა','лошадиная сила','мощность'],['torque','rpm'],['horsepower','torque'],['f80'],[references.power,references.units],
    text('Horsepower','A unit of power: how quickly an engine or motor can do work.','Mechanical hp and metric PS are slightly different units. Compare the same standard and measurement location; engine output and wheel output are not interchangeable.'),
    text('ცხენის ძალა','სიმძლავრის ერთეული: რამდენად სწრაფად შეუძლია ძრავს სამუშაოს შესრულება.','მექანიკური hp და მეტრული PS ოდნავ განსხვავდება. შეადარეთ ერთი სტანდარტითა და ერთ ადგილზე გაზომილი მონაცემები; ძრავისა და ბორბლებზე სიმძლავრე ერთნაირი არ არის.'),
    text('Лошадиная сила','Единица мощности: насколько быстро двигатель способен выполнять работу.','Механическая hp и метрическая PS немного различаются. Сравнивайте одинаковые стандарты и место измерения; мощность двигателя и мощность на колёсах не равнозначны.')),
  term('torque','numbers',['Nm','N m','lb ft','lb-ft','მაბრუნებელი მომენტი','крутящий момент'],['horsepower','rpm','differential'],['torque','transmission'],['f10-m5'],[references.torque],
    text('Torque','The turning effect of a force acting at a distance from an axis.','Engine torque is commonly given in newton-metres. Gearing changes torque at the wheels, so peak engine torque alone cannot predict a car’s acceleration.'),
    text('მაბრუნებელი მომენტი','ბრუნვის ღერძიდან დაშორებით მოქმედი ძალის მბრუნავი ეფექტი.','ძრავის მომენტი ხშირად ნიუტონ-მეტრებში გამოისახება. გადაცემები ბორბლებზე მომენტს ცვლის, ამიტომ მარტო ძრავის მაქსიმალური მომენტი აჩქარებას ვერ განსაზღვრავს.'),
    text('Крутящий момент','Вращающее действие силы, приложенной на расстоянии от оси.','Момент двигателя обычно выражают в ньютон-метрах. Передаточные числа меняют момент на колёсах, поэтому один пик момента двигателя не определяет разгон автомобиля.')),
  term('dct','drivetrain',['dual clutch','dual-clutch','double clutch','M DCT','DKG','ორმაგი ქურო','двойное сцепление'],['torque','rpm','differential'],['transmission'],['f10-m5','f80'],[references.dct,references.bmwM5],
    text('DCT','A dual-clutch transmission with separate clutches for two groups of gears.','It can preselect the next gear on the inactive path, then hand over drive between clutches. A conventional torque-converter automatic uses a different arrangement.'),
    text('DCT','ორმაგი ქუროს ტრანსმისია: გადაცემების ორ ჯგუფს ცალკე ქურო აქვს.','შემდეგი გადაცემა არააქტიურ ნაწილში წინასწარ ირჩევა, შემდეგ ძალის გადაცემა ქუროებს შორის იცვლება. ჰიდროტრანსფორმატორიანი ავტომატური კოლოფი სხვაგვარად არის მოწყობილი.'),
    text('DCT','Коробка с двумя сцеплениями для двух отдельных групп передач.','Следующую передачу можно заранее выбрать в неактивной ветви, затем передать тягу между сцеплениями. Обычная гидротрансформаторная автоматическая коробка устроена иначе.')),
  term('ecu','electronics',['DME','engine control unit','engine management','electronic control unit','ძრავის მართვის ბლოკი','ЭБУ'],['vanos','valvetronic','wastegate'],['electronics'],[],[references.ecu],
    text('ECU / DME','The engine controller that reads inputs and coordinates fuel, ignition and airflow.','ECU can also mean any electronic control unit; BMW petrol engine management is often called DME. Its calibration works with hardware and operating limits.'),
    text('ECU / DME','ძრავის კონტროლერი, რომელიც საწვავს, ანთებასა და ჰაერის მიწოდებას მართავს.','ECU სხვა ელექტრონულ მართვის ბლოკსაც შეიძლება ნიშნავდეს; BMW-ის ბენზინის ძრავის მართვას ხშირად DME ჰქვია. პროგრამა აპარატურასა და სამუშაო შეზღუდვებთან ერთად მოქმედებს.'),
    text('ЭБУ / DME','Контроллер двигателя, управляющий топливом, зажиганием и подачей воздуха по входным сигналам.','ECU может обозначать любой электронный блок; управление бензиновым двигателем BMW часто называют DME. Калибровка связана с оборудованием и допустимыми режимами работы.')),
  term('m-differential','drivetrain',['Active M Differential','M differential','limited slip','LSD','M დიფერენციალი','активный M-дифференциал'],['differential','xdrive','torque'],['differential','transmission'],['f10-m5'],[references.bmwM5],
    text('Active M Differential','An electronically controlled limited-slip rear differential used on specified BMW M models.','In the documented F10 M5, a controlled multi-plate clutch varies the locking effect. It manages the rear wheels; xDrive also concerns drive between axles.'),
    text('აქტიური M დიფერენციალი','ელექტრონულად მართვადი შეზღუდული სრიალის უკანა დიფერენციალი გარკვეულ BMW M მოდელებზე.','დოკუმენტირებულ F10 M5-ში მრავალდისკოიანი ქურო ბლოკირების ხარისხს ცვლის. ის უკანა ბორბლებს შორის მუშაობს; xDrive ღერძებს შორის ამძრავსაც ეხება.'),
    text('Активный M-дифференциал','Задний дифференциал повышенного трения с электронным управлением на определённых BMW M.','В документированном F10 M5 многодисковая муфта изменяет степень блокировки. Он работает между задними колёсами; xDrive также распределяет тягу между осями.')),
  term('turbocharger','air',['turbo','turbocharging','twin scroll','twin-scroll','ტურბო','турбина','турбокомпрессор'],['boost','wastegate','intercooler'],['turbocharging','part-turbocharger'],['f22','f80'],[references.turbo],
    text('Turbocharger','An exhaust-driven turbine and shared-shaft compressor that compress intake air.','The exhaust and intake streams remain separate. Twin-scroll describes divided turbine inlet passages; twin turbo describes two turbochargers. Those descriptions are not interchangeable.'),
    text('ტურბოკომპრესორი','გამონაბოლქვით ამოძრავებული ტურბინა და მასთან დაკავშირებული ჰაერის კომპრესორი.','გამონაბოლქვისა და შემშვები ჰაერის ნაკადები ერთმანეთისგან გამიჯნულია. Twin-scroll ტურბინის განცალკევებულ შემყვან არხებს ნიშნავს, twin turbo კი ორ ტურბოკომპრესორს.'),
    text('Турбокомпрессор','Выхлопная турбина и компрессор на общем валу, сжимающий впускной воздух.','Выхлоп и впускной воздух не смешиваются. Twin-scroll означает раздельные входные каналы турбины, а twin turbo — два турбокомпрессора; это разные характеристики.')),
  term('rpm','numbers',['revolutions per minute','rev min','engine speed','ბრუნი წუთში','об/мин','обороты'],['horsepower','torque','crankshaft'],['rpm','combustion'],['e92'],[references.bmwM5,references.combustion],
    text('RPM','Revolutions per minute: a measure of rotational speed.','Engine RPM describes crankshaft speed, not road speed. The chosen gear and final-drive ratio change the relationship between engine rotation and wheel rotation.'),
    text('RPM / ბრუნი წუთში','ბრუნთა რაოდენობა წუთში — ბრუნვის სიჩქარის საზომი.','ძრავის RPM მუხლა ლილვის ბრუნვას აჩვენებს და არა მოძრაობის სიჩქარეს. შერჩეული გადაცემა და მთავარი გადაცემის რიცხვი ძრავისა და ბორბლების ბრუნვის კავშირს ცვლის.'),
    text('Об/мин / RPM','Количество оборотов за минуту: мера частоты вращения.','Обороты двигателя означают скорость коленвала, а не скорость машины. Выбранная передача и главная пара меняют связь между вращением двигателя и колёс.')),
]);

const categoryCopy=Object.freeze({
  en:{all:'All terms',engine:'Inside the engine',air:'Air & boost',drivetrain:'Drivetrain',numbers:'Reading the numbers',electronics:'Electronics'},
  ka:{all:'ყველა ტერმინი',engine:'ძრავის შიგნით',air:'ჰაერი და ჩაბერვა',drivetrain:'ტრანსმისია',numbers:'რიცხვების მნიშვნელობა',electronics:'ელექტრონიკა'},
  ru:{all:'Все термины',engine:'Внутри двигателя',air:'Воздух и наддув',drivetrain:'Трансмиссия',numbers:'Что означают цифры',electronics:'Электроника'},
});
const uiCopy=Object.freeze({
  en:{kicker:'THE WORDS BEHIND THE MACHINE',title:'Get to know the language.',intro:'Short explanations. Useful connections. Open any term to go a little deeper.',search:'Find a term',placeholder:'Try VANOS, torque or a part name…',clear:'Clear search',filters:'Glossary categories',count:'terms',none:'No matching terms.',empty:'Try another word or clear the filters.',reset:'Reset search',define:'Read the definition of',close:'Close definition',detail:'A little deeper',related:'Connect the ideas',lessons:'Keep learning',lesson:'Open lesson',models:'Explore a documented example',sources:'Primary references',read:'Read definition',note:'Examples refer to a documented configuration; equipment can vary by year, trim and market.'},
  ka:{kicker:'სიტყვები, რომლებიც მანქანას ხსნის',title:'გაიცანით ავტომობილის ენა.',intro:'მოკლე განმარტებები და სასარგებლო კავშირები. მეტის გასაგებად გახსენით ტერმინი.',search:'ტერმინის ძებნა',placeholder:'მაგალითად: VANOS, მომენტი ან დეტალის სახელი…',clear:'ძებნის გასუფთავება',filters:'ტერმინების კატეგორიები',count:'ტერმინი',none:'ტერმინი ვერ მოიძებნა.',empty:'სცადეთ სხვა სიტყვა ან გაასუფთავეთ ფილტრები.',reset:'ძებნის განულება',define:'ტერმინის განმარტება:',close:'განმარტების დახურვა',detail:'უფრო ვრცლად',related:'დააკავშირეთ იდეები',lessons:'გააგრძელეთ სწავლა',lesson:'გაკვეთილის გახსნა',models:'იხილეთ დოკუმენტირებული მაგალითი',sources:'პირველწყაროები',read:'განმარტების წაკითხვა',note:'მაგალითები კონკრეტულ კონფიგურაციას ეხება; აღჭურვილობა წელს, ვერსიასა და ბაზარს მიხედვით იცვლება.'},
  ru:{kicker:'СЛОВА, КОТОРЫЕ ОБЪЯСНЯЮТ МАШИНУ',title:'Разберитесь в терминах.',intro:'Короткие объяснения и полезные связи. Откройте любой термин, чтобы узнать больше.',search:'Найти термин',placeholder:'Например: VANOS, момент или название детали…',clear:'Очистить поиск',filters:'Категории словаря',count:'терминов',none:'Ничего не найдено.',empty:'Попробуйте другое слово или сбросьте фильтры.',reset:'Сбросить поиск',define:'Прочитать определение:',close:'Закрыть определение',detail:'Чуть подробнее',related:'Свяжите понятия',lessons:'Продолжить обучение',lesson:'Открыть урок',models:'Изучить документированный пример',sources:'Первичные источники',read:'Прочитать определение',note:'Примеры относятся к конкретной конфигурации; оборудование зависит от года, версии и рынка.'},
});
const lessonCopy={
  en:{'engine-codes':'BMW engine families',combustion:'The four-stroke engine','first-engine':'Your first engine',transmission:'From revs to road speed',differential:'Different speeds. One corner.',turbocharging:'Air under pressure',cooling:'Engine cooling',horsepower:'What horsepower means',torque:'What torque means',rpm:'Understanding RPM',electronics:'Engine electronics','part-turbocharger':'Identify the turbocharger'},
  ka:{'engine-codes':'BMW-ის ძრავების ოჯახები',combustion:'ოთხტაქტიანი ძრავი','first-engine':'პირველი გაცნობა ძრავთან',transmission:'ბრუნვიდან მოძრაობამდე',differential:'სხვადასხვა სიჩქარე მოსახვევში',turbocharging:'ჰაერი წნევის ქვეშ',cooling:'ძრავის გაგრილება',horsepower:'რას ნიშნავს ცხენის ძალა',torque:'მაბრუნებელი მომენტის მნიშვნელობა',rpm:'RPM-ის მნიშვნელობა',electronics:'ძრავის ელექტრონიკა','part-turbocharger':'ამოიცანით ტურბოკომპრესორი'},
  ru:{'engine-codes':'Семейства двигателей BMW',combustion:'Четырёхтактный двигатель','first-engine':'Первое знакомство с двигателем',transmission:'От оборотов к скорости',differential:'Разные скорости в одном повороте',turbocharging:'Воздух под давлением',cooling:'Охлаждение двигателя',horsepower:'Что означает мощность',torque:'Что означает крутящий момент',rpm:'Разбираемся в оборотах',electronics:'Электроника двигателя','part-turbocharger':'Узнайте турбокомпрессор'},
};
const modelCopy=Object.freeze({'f80':'BMW M3 · F80','e92':'BMW M3 · E92','f22':'BMW M235i Coupé · F22','f10-m5':'BMW M5 · F10','g80-m3-cs':'BMW M3 CS · G80 CS'});
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const languageOf=value=>['en','ka','ru'].includes(String(value||'').split('-')[0])?String(value).split('-')[0]:'en';
const normalized=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const byId=new Map(glossaryEntries.map(entry=>[entry.id,entry]));
export function glossaryCategories(language='en'){return {...categoryCopy[languageOf(language)]};}
export function glossaryCopy(language='en'){return {...uiCopy[languageOf(language)]};}
export function getGlossaryEntry(id,language='en'){
  const entry=byId.get(id);if(!entry)return null;
  const lang=languageOf(language);
  return {...entry,...entry.i18n[lang],categoryLabel:categoryCopy[lang][entry.category]};
}

// Search every supported language and common abbreviations, while rendering the selected language.
export function searchGlossary(query='',{language='en',category='all'}={}){
  const lang=languageOf(language),words=normalized(query).split(' ').filter(Boolean);
  return glossaryEntries.filter(entry=>category==='all'||entry.category===category).map(entry=>{
    const names=normalized([entry.id,...entry.aliases,...Object.values(entry.i18n).map(t=>t.name)].join(' '));
    const body=normalized(Object.values(entry.i18n).map(t=>t.summary+' '+t.detail).join(' '));
    if(!words.every(word=>names.includes(word)||body.includes(word)))return null;
    const score=words.reduce((total,word)=>total+(normalized(entry.i18n[lang].name)===word?30:names.includes(word)?10:1),0);
    return {entry:getGlossaryEntry(entry.id,lang),score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.entry.name.localeCompare(b.entry.name,lang)).map(result=>result.entry);
}

export function renderGlossaryTerm(id,{language='en',label,className=''}={}){
  const entry=getGlossaryEntry(id,language);if(!entry)return esc(label||id);
  return `<button type="button" class="acg-term ${esc(className)}" data-glossary-term="${esc(id)}" aria-haspopup="dialog" aria-label="${esc(uiCopy[languageOf(language)].define+' '+entry.name)}" title="${esc(entry.summary)}">${esc(label||entry.name)}<span aria-hidden="true"> ⓘ</span></button>`;
}
function renderResults(query,category,language){
  const copy=uiCopy[language],entries=searchGlossary(query,{language,category});
  return `<p class="acg-result-count" role="status" aria-live="polite" aria-atomic="true">${entries.length} ${esc(copy.count)}</p>${entries.length?`<div class="acg-grid">${entries.map(entry=>`<button type="button" class="acg-card" data-glossary-term="${entry.id}" aria-haspopup="dialog"><span class="acg-category">${esc(entry.categoryLabel)}</span><strong>${esc(entry.name)}</strong><span class="acg-summary">${esc(entry.summary)}</span><span class="acg-card-action">${esc(copy.read)} <span aria-hidden="true">↗</span></span></button>`).join('')}</div>`:`<div class="acg-empty"><h2>${esc(copy.none)}</h2><p>${esc(copy.empty)}</p><button type="button" data-glossary-reset>${esc(copy.reset)}</button></div>`}`;
}
export function renderGlossary({query='',category='all',language='en'}={}){
  const lang=languageOf(language),copy=uiCopy[lang],categories=categoryCopy[lang];
  if(!Object.hasOwn(categories,category))category='all';
  return `<section class="acg-library" lang="${lang}"><div class="acg-heading"><span class="acg-eyebrow">${esc(copy.kicker)}</span><h1 tabindex="-1" data-ac-focus="view">${esc(copy.title)}</h1><p>${esc(copy.intro)}</p></div><div class="acg-search"><label><span>${esc(copy.search)}</span><input type="search" data-glossary-search value="${esc(query)}" placeholder="${esc(copy.placeholder)}" autocomplete="off" spellcheck="false" maxlength="100"></label><button type="button" data-glossary-clear aria-label="${esc(copy.clear)}" ${!query?'hidden':''}>×</button></div><div class="acg-filters" role="group" aria-label="${esc(copy.filters)}">${Object.entries(categories).map(([id,label])=>`<button type="button" data-glossary-category="${id}" aria-pressed="${category===id}">${esc(label)}</button>`).join('')}</div><div data-glossary-results>${renderResults(query,category,lang)}</div></section>`;
}

function ensureStyles(document){
  const href=new URL('./academy-glossary.css',import.meta.url).href;
  if([...document.querySelectorAll('link[rel="stylesheet"]')].some(link=>link.href===href))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);
}
let instance=0;
const scrollLocks=new WeakMap();
function lockScroll(document){
  let lock=scrollLocks.get(document);
  if(lock){lock.count++;return;}
  lock={count:1,overflow:document.body.style.overflow};scrollLocks.set(document,lock);document.body.style.overflow='hidden';
}
function unlockScroll(document){
  const lock=scrollLocks.get(document);if(!lock||--lock.count)return;
  document.body.style.overflow=lock.overflow;scrollLocks.delete(document);
}

/** Delegated term definitions. Works with dynamically replaced academy markup.
 * Use renderGlossaryTerm() or a button[data-glossary-term="vanos"] inside root.
 * onLesson(id) can open an existing curriculum lesson. Model links work without a callback.
 */
export function mountGlossaryDefinitions(root,{language,getLanguage,onLesson,onModel}={}){
  if(typeof root==='string')root=document.querySelector(root);
  if(!root)throw new Error('A glossary root is required.');
  const document=root.ownerDocument||root,window=document.defaultView,controller=new window.AbortController(),signal=controller.signal;
  ensureStyles(document);
  const dialog=document.createElement('dialog'),id='acg-definition-'+(++instance);
  dialog.className='acg-dialog';dialog.setAttribute('aria-labelledby',id+'-title');dialog.setAttribute('aria-describedby',id+'-summary');document.body.append(dialog);
  let currentId=null,opener=null,locked=false,destroyed=false;
  const currentLanguage=()=>languageOf(getLanguage?.()||language||document.documentElement.lang);
  function content(){
    const lang=currentLanguage(),entry=getGlossaryEntry(currentId,lang),copy=uiCopy[lang];if(!entry)return;
    dialog.lang=lang;
    dialog.innerHTML=`<div class="acg-dialog-header"><span class="acg-eyebrow">${esc(entry.categoryLabel)}</span><button type="button" data-glossary-close aria-label="${esc(copy.close)}" autofocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="acg-dialog-body"><h2 id="${id}-title">${esc(entry.name)}</h2><p class="acg-definition-summary" id="${id}-summary">${esc(entry.summary)}</p><section><h3>${esc(copy.detail)}</h3><p>${esc(entry.detail)}</p></section>${entry.related.length?`<section><h3>${esc(copy.related)}</h3><div class="acg-related">${entry.related.map(related=>renderGlossaryTerm(related,{language:lang})).join('')}</div></section>`:''}${onLesson&&entry.lessonIds.length?`<section><h3>${esc(copy.lessons)}</h3><div class="acg-lesson-links">${entry.lessonIds.map(lessonId=>`<button type="button" data-glossary-lesson="${esc(lessonId)}">${esc(lessonCopy[lang][lessonId]||copy.lesson)} <span aria-hidden="true">→</span></button>`).join('')}</div></section>`:''}${entry.modelIds.length?`<section><h3>${esc(copy.models)}</h3><div class="acg-model-links">${entry.modelIds.map(modelId=>`<a href="/models?model=${encodeURIComponent(modelId)}" data-glossary-model="${esc(modelId)}">${esc(modelCopy[modelId])} <span aria-hidden="true">↗</span></a>`).join('')}</div><p class="acg-example-note">${esc(copy.note)}</p></section>`:''}<section class="acg-sources"><h3>${esc(copy.sources)}</h3>${entry.sources.map(reference=>`<a href="${esc(reference.url)}" target="_blank" rel="noopener noreferrer">${esc(reference.label)} <span aria-hidden="true">↗</span></a>`).join('')}</section></div>`;
  }
  function close(){
    if(!dialog.open)return;
    if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');afterClose();}
  }
  function afterClose(){
    if(locked){unlockScroll(document);locked=false;}
    currentId=null;if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;
  }
  function open(termId,trigger){
    if(destroyed||!byId.has(termId))return false;
    const wasOpen=dialog.open;if(!wasOpen)opener=trigger||document.activeElement;
    currentId=termId;content();
    if(!wasOpen){
      if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.setAttribute('aria-modal','true');}
      lockScroll(document);locked=true;
    }
    dialog.scrollTop=0;dialog.querySelector('.acg-dialog-body')?.scrollTo?.(0,0);
    dialog.querySelector('[data-glossary-close]')?.focus({preventScroll:true});return true;
  }
  function click(event){
    const target=event.target.closest?.('[data-glossary-term]');
    if(target&&(root.contains(target)||dialog.contains(target))){event.preventDefault();open(target.dataset.glossaryTerm,target);return;}
    if(!dialog.contains(event.target))return;
    if(event.target.closest('[data-glossary-close]')){close();return;}
    const lesson=event.target.closest('[data-glossary-lesson]');if(lesson&&onLesson){const lessonId=lesson.dataset.glossaryLesson;close();onLesson(lessonId);return;}
    const model=event.target.closest('[data-glossary-model]');if(model){const modelId=model.dataset.glossaryModel;if(onModel){event.preventDefault();close();onModel(modelId);}else close();}
  }
  root.addEventListener('click',click,{signal});if(root!==document)dialog.addEventListener('click',click,{signal});
  dialog.addEventListener('close',afterClose,{signal});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();
  },{signal});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(element=>element.getClientRects().length),first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  },{signal});
  window.addEventListener('apex:languagechange',()=>{if(dialog.open){content();dialog.querySelector('[data-glossary-close]')?.focus({preventScroll:true});}},{signal});
  return {open,close,destroy(){if(destroyed)return;destroyed=true;close();if(locked){unlockScroll(document);locked=false;}controller.abort();dialog.remove();}};
}

/** Self-contained searchable view. Returns cleanup and the same definition opener. */
export function mountGlossary(container,options={}){
  if(typeof container==='string')container=document.querySelector(container);
  if(!container)throw new Error('A glossary container is required.');
  const document=container.ownerDocument,window=document.defaultView,controller=new window.AbortController(),signal=controller.signal;
  ensureStyles(document);let query='',category='all';
  const language=()=>languageOf(options.getLanguage?.()||options.language||document.documentElement.lang);
  const definitions=mountGlossaryDefinitions(container,{...options,getLanguage:language});
  function render(){container.innerHTML=renderGlossary({query,category,language:language()});}
  function results(){
    container.querySelector('[data-glossary-results]').innerHTML=renderResults(query,category,language());
    container.querySelector('[data-glossary-clear]').hidden=!query;
    for(const button of container.querySelectorAll('[data-glossary-category]'))button.setAttribute('aria-pressed',String(button.dataset.glossaryCategory===category));
  }
  container.addEventListener('input',event=>{if(event.target.matches('[data-glossary-search]')){query=event.target.value.slice(0,100);results();}},{signal});
  container.addEventListener('click',event=>{
    const filter=event.target.closest('[data-glossary-category]');if(filter){category=filter.dataset.glossaryCategory;results();return;}
    if(event.target.closest('[data-glossary-clear],[data-glossary-reset]')){query='';if(event.target.closest('[data-glossary-reset]'))category='all';const input=container.querySelector('[data-glossary-search]');input.value='';results();input.focus();}
  },{signal});
  window.addEventListener('apex:languagechange',render,{signal});render();
  return {...definitions,refresh:render,destroy(){controller.abort();definitions.destroy();container.replaceChildren();}};
}
