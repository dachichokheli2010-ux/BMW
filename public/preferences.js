// Shared, local preferences. Model names, factory data and original source prose
// remain verbatim; interface copy is translated without rebuilding live controls.
const LANGUAGE_KEY = 'apex-language';
const THEME_KEY = 'apex-theme';
const languages = ['en', 'ka', 'de'];
const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Private browsing can disable storage. */ } };
let language = languages.includes(readPreference(LANGUAGE_KEY)) ? readPreference(LANGUAGE_KEY) : 'en';
let theme = ['light', 'dark', 'system'].includes(readPreference(THEME_KEY)) ? readPreference(THEME_KEY) : 'system';
const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

const copy = [
  ['Models', 'მოდელები', 'Modelle'],
  ['Cars', 'ავტომობილები', 'Fahrzeuge'],
  ['M Collection', 'M კოლექცია', 'M Kollektion'],
  ['Electric', 'ელექტრო', 'Elektrisch'],
  ['Inside BMW', 'BMW-ის სამყარო', 'BMW entdecken'],
  ['Car Parts', 'კომპონენტები', 'Fahrzeugteile'],
  ['About', 'ჩვენ შესახებ', 'Über APEX'],
  ['Language', 'ენა', 'Sprache'],
  ['Main navigation', 'მთავარი ნავიგაცია', 'Hauptnavigation'],
  ['Skip to content', 'შიგთავსზე გადასვლა', 'Zum Inhalt springen'],
  ['Saved models', 'შენახული მოდელები', 'Gespeicherte Modelle'],
  ['About APEX', 'APEX-ის შესახებ', 'Über APEX'],
  ['Back to top ↑', 'თავში დაბრუნება ↑', 'Nach oben ↑'],
  ['THE COLLECTION', 'კოლექცია', 'DIE KOLLEKTION'],
  ['MORE TO DISCOVER', 'მეტი აღმოსაჩენი', 'MEHR ENTDECKEN'],
  ['THE M COLLECTION', 'M კოლექცია', 'DIE M KOLLEKTION'],
  ['A DIFFERENT KIND OF ENERGY', 'განსხვავებული ენერგია', 'EINE ANDERE ART VON ENERGIE'],
  ["THE ENTHUSIAST'S GARAGE", 'ენთუზიასტების ავტოფარეხი', 'DIE GARAGE FÜR ENTHUSIASTEN'],
  ['BMW M / THE DRIVE TO EXPLORE', 'BMW M / აღმოჩენის სურვილი', 'BMW M / DER ANTRIEB ZUM ENTDECKEN'],
  ['ICONS. ENGINEERING. EMOTION.', 'ლეგენდები. ინჟინერია. ემოცია.', 'IKONEN. TECHNIK. EMOTION.'],
  ['BMW. THROUGH THE GENERATIONS.', 'BMW. ყველა თაობაში.', 'BMW. DURCH DIE GENERATIONEN.'],
  ['A curated collection across BMW generations. Specifications and photographs identify their model year and market; availability varies.', 'რჩეული კოლექცია BMW-ის სხვადასხვა თაობიდან. მახასიათებლები და ფოტოები მიუთითებს მოდელის წელსა და ბაზარს; ხელმისაწვდომობა განსხვავდება.', 'Eine kuratierte Kollektion verschiedener BMW Generationen. Daten und Fotos nennen Modelljahr und Markt; die Verfügbarkeit variiert.'],
  ['Your next obsession.', 'თქვენი ახალი გატაცება.', 'Deine nächste Leidenschaft.'],
  ['Your next', 'თქვენი ახალი', 'Deine nächste'],
  ['obsession.', 'გატაცება.', 'Leidenschaft.'],
  ['From timeless icons to the next generation. Find your BMW and get closer to the engineering.', 'მარადიული ლეგენდებიდან ახალ თაობამდე. იპოვეთ თქვენი BMW და გაიცანით მისი ინჟინერია.', 'Von zeitlosen Ikonen bis zur nächsten Generation. Finde deinen BMW und entdecke seine Technik.'],
  ['Models to explore', 'მოდელი აღმოსაჩენად', 'Modelle zum Entdecken'],
  ['M icons', 'M ლეგენდები', 'M Ikonen'],
  ['A passion for every generation.', 'გატაცება ყველა თაობისთვის.', 'Leidenschaft für jede Generation.'],
  ['Browse the collection', 'დაათვალიერეთ კოლექცია', 'Kollektion durchstöbern'],
  ['Find the one that moves you.', 'იპოვეთ ის, რომელიც შთაგაგონებთ.', 'Finde den BMW, der dich bewegt.'],
  ['The collection', 'კოლექცია', 'Die Kollektion'],
  ['Showing {shown} of {total} models', 'ნაჩვენებია {shown} / {total} მოდელი', '{shown} von {total} Modellen angezeigt'],
  ['Show more models', 'მეტი მოდელის ნახვა', 'Weitere Modelle anzeigen'],
  ['Factory figures use each model’s stated year, market and units.', 'ქარხნული მონაცემები შეესაბამება თითოეული მოდელის მითითებულ წელს, ბაზარსა და ერთეულებს.', 'Die Werksdaten beziehen sich auf das jeweils angegebene Modelljahr, den Markt und die Einheiten.'],
  ['Pure performance. Unmistakably M.', 'სუფთა წარმადობა. უტყუარად M.', 'Pure Leistung. Unverkennbar M.'],
  ['Meet the machines that made the letter legendary. From the original M1 to a new era of M.', 'გაიცანით ავტომობილები, რომლებმაც ეს ასო ლეგენდად აქციეს. პირველი M1-დან M-ის ახალ ეპოქამდე.', 'Entdecke die Maschinen, die den Buchstaben zur Legende machten. Vom ersten M1 bis in eine neue M Ära.'],
  ['Electric. With a BMW soul.', 'ელექტრო. BMW-ის სულით.', 'Elektrisch. Mit BMW Seele.'],
  ['Discover the design and engineering behind BMW electric.', 'აღმოაჩინეთ BMW-ის ელექტრო მოდელების დიზაინი და ინჟინერია.', 'Entdecke Design und Technik der elektrischen BMW.'],
  ['BMW EXPLORER', 'BMW გზამკვლევი', 'BMW EXPLORER'],
  ['Your garage, on this device.', 'თქვენი ავტოფარეხი ამ მოწყობილობაზე.', 'Deine Garage auf diesem Gerät.'],
  ['Photos & sources', 'ფოტოები და წყაროები', 'Fotos und Quellen'],
  ['One badge. Endless possibilities.', 'ერთი ემბლემა. უსაზღვრო შესაძლებლობები.', 'Ein Emblem. Unendliche Möglichkeiten.'],
  ['Explore the collection', 'აღმოაჩინეთ კოლექცია', 'Kollektion entdecken'],
  ['Discover BMW M', 'აღმოაჩინეთ BMW M', 'BMW M entdecken'],
  ['The art of driving.', 'მართვის ხელოვნება.', 'Die Kunst des Fahrens.'],
  ['Find your BMW', 'იპოვეთ თქვენი BMW', 'Finde deinen BMW'],
  ['All models', 'ყველა მოდელი', 'Alle Modelle'],
  ['‹ All models', '‹ ყველა მოდელი', '‹ Alle Modelle'],
  ['All BMWs', 'ყველა BMW', 'Alle BMW'],
  ['M cars', 'M მოდელები', 'M Modelle'],
  ['3D cars', '3D მოდელები', '3D Modelle'],
  ['BMW M', 'BMW M', 'BMW M'],
  ['Sedans', 'სედანები', 'Limousinen'],
  ['Coupes', 'კუპეები', 'Coupés'],
  ['Coupés', 'კუპეები', 'Coupés'],
  ['SUVs', 'SUV-ები', 'SUVs'],
  ['Hatchbacks', 'ჰეჩბეკები', 'Kompaktmodelle'],
  ['Roadsters', 'როდსტერები', 'Roadster'],
  ['Convertibles', 'კაბრიოლეტები', 'Cabrios'],
  ['Touring', 'უნივერსალები', 'Touring'],
  ['Saved', 'შენახული', 'Gespeichert'],
  ['Your garage', 'თქვენი ავტოფარეხი', 'Deine Garage'],
  ['Compare', 'შედარება', 'Vergleichen'],
  ['Clear all', 'ყველას გასუფთავება', 'Alle entfernen'],
  ['Clear', 'გასუფთავება', 'Löschen'],
  ['Sort by', 'დალაგება', 'Sortieren nach'],
  ['Power: high to low', 'სიმძლავრე: კლებადობით', 'Leistung: absteigend'],
  ['Power: low to high', 'სიმძლავრე: ზრდადობით', 'Leistung: aufsteigend'],
  ['Newest first', 'ჯერ უახლესი', 'Neueste zuerst'],
  ['Collection order', 'კოლექციის მიმდევრობა', 'Reihenfolge der Kollektion'],
  ['Model name', 'მოდელის სახელი', 'Modellname'],
  ['Generation code', 'თაობის კოდი', 'Baureihencode'],
  ['Save to garage', 'ავტოფარეხში შენახვა', 'In der Garage speichern'],
  ['Remove from garage', 'ავტოფარეხიდან წაშლა', 'Aus der Garage entfernen'],
  ['Add to comparison', 'შედარებაში დამატება', 'Zum Vergleich hinzufügen'],
  ['Remove from comparison', 'შედარებიდან წაშლა', 'Aus dem Vergleich entfernen'],
  ['View model', 'მოდელის ნახვა', 'Modell ansehen'],
  ['Explore model', 'მოდელის აღმოჩენა', 'Modell entdecken'],
  ['Select up to 3 models to compare.', 'შესადარებლად აირჩიეთ მაქსიმუმ 3 მოდელი.', 'Wähle bis zu 3 Modelle für den Vergleich.'],
  ['No saved models yet', 'ჯერ არცერთი მოდელია შენახული', 'Noch keine Modelle gespeichert'],
  ['Save a model with the heart button to build your garage.', 'თქვენი ავტოფარეხის შესავსებად დააჭირეთ მოდელის გულის ღილაკს.', 'Speichere Modelle mit dem Herzsymbol in deiner Garage.'],
  ['No matching BMWs', 'შესაბამისი BMW ვერ მოიძებნა', 'Keine passenden BMW gefunden'],
  ['Try another model, engine or generation.', 'სცადეთ სხვა მოდელი, ძრავა ან თაობა.', 'Versuche ein anderes Modell, einen Motor oder eine Baureihe.'],
  ['Try a model name, generation or engine code.', 'მოძებნეთ მოდელის სახელი, თაობა ან ძრავის კოდი.', 'Suche nach Modellname, Baureihe oder Motorcode.'],
  ['Reset filters', 'ფილტრების გასუფთავება', 'Filter zurücksetzen'],
  ['Reset search & filters', 'ძიებისა და ფილტრების გასუფთავება', 'Suche und Filter zurücksetzen'],
  ['Reset search', 'ძიების გასუფთავება', 'Suche zurücksetzen'],
  ['Search BMW models, generations or engines', 'მოძებნეთ BMW მოდელები, თაობები ან ძრავები', 'BMW Modelle, Baureihen oder Motoren suchen'],
  ['Search a model, generation or engine…', 'მოძებნეთ მოდელი, თაობა ან ძრავა…', 'Modell, Baureihe oder Motor suchen…'],
  ['Filter BMW collection', 'BMW კოლექციის გაფილტვრა', 'BMW Kollektion filtern'],
  ['BMW model collection', 'BMW მოდელების კოლექცია', 'BMW Modellkollektion'],
  ['The icons. The innovators.', 'ლეგენდები. ინოვატორები.', 'Die Ikonen. Die Wegbereiter.'],
  ['Born on the track.', 'ტრასაზე დაბადებული.', 'Auf der Rennstrecke geboren.'],
  ['Built for what comes next.', 'შექმნილია მომავლისთვის.', 'Bereit für das, was kommt.'],
  ['Explore M models', 'აღმოაჩინეთ M მოდელები', 'M Modelle entdecken'],
  ['Explore electric', 'აღმოაჩინეთ ელექტრო მოდელები', 'Elektromodelle entdecken'],
  ['An independent BMW enthusiast experience.', 'დამოუკიდებელი სივრცე BMW-ის მოყვარულთათვის.', 'Ein unabhängiges Erlebnis für BMW Fans.'],
  ['Back to top', 'თავში დაბრუნება', 'Nach oben'],
  ['Compare models', 'მოდელების შედარება', 'Modelle vergleichen'],
  ['Remove', 'წაშლა', 'Entfernen'],
  ['Power', 'სიმძლავრე', 'Leistung'],
  ['Torque', 'ბრუნვის მომენტი', 'Drehmoment'],
  ['Engine', 'ძრავა', 'Motor'],
  ['Generation', 'თაობა', 'Baureihe'],
  ['Body style', 'ძარის ტიპი', 'Karosserieform'],
  ['Specification', 'მახასიათებლები', 'Technische Daten'],
  ['Open model', 'მოდელის გახსნა', 'Modell öffnen'],
  ['Close', 'დახურვა', 'Schließen'],
  ['Close dialog', 'ფანჯრის დახურვა', 'Dialog schließen'],
  ['Browse by series', 'მოძებნეთ სერიით', 'Nach Baureihe entdecken'],
  ['All series', 'ყველა სერია', 'Alle Baureihen'],
  ['Heritage', 'მემკვიდრეობა', 'Klassiker'],
  ['Current & recent', 'მიმდინარე და უახლესი', 'Aktuell und jüngst'],
  ['APEX / THE COLLECTION', 'APEX / კოლექცია', 'APEX / DIE KOLLEKTION'],
  ['Choose your', 'აირჩიეთ თქვენი', 'Wähle deinen'],
  ['Explore model photographs, factory specifications and engine character.', 'აღმოაჩინეთ მოდელების ფოტოები, ქარხნული მახასიათებლები და ძრავების ხასიათი.', 'Entdecke Modellfotos, Werksdaten und den Charakter der Motoren.'],
  ['SELECT MODEL', 'აირჩიეთ მოდელი', 'MODELL WÄHLEN'],
  ['Select BMW model', 'აირჩიეთ BMW მოდელი', 'BMW Modell wählen'],
  ['Explore 3D cars', 'აღმოაჩინეთ 3D მოდელები', '3D Modelle entdecken'],
  ['INTERACTIVE 3D EXTERIOR', 'ინტერაქტიული 3D ექსტერიერი', 'INTERAKTIVE 3D AUSSENANSICHT'],
  ['Enter 3D view', '3D ხედის გახსნა', '3D Ansicht öffnen'],
  ['Drag to rotate · scroll or pinch to zoom', 'გადაათრიეთ მოსაბრუნებლად · მასშტაბისთვის გამოიყენეთ სქროლი ან ორი თითი', 'Ziehen zum Drehen · Scrollen oder Aufziehen zum Zoomen'],
  ['Original 3D model', 'ორიგინალი 3D მოდელი', 'Originales 3D Modell'],
  ['Reload 3D viewer', '3D ხედის ხელახლა ჩატვირთვა', '3D Ansicht neu laden'],
  ['Exterior', 'ექსტერიერი', 'Außenansicht'],
  ['3D exterior', '3D ექსტერიერი', '3D Außenansicht'],
  ['3D exteriors', '3D ექსტერიერები', '3D Außenansichten'],
  ['3D source', '3D წყარო', '3D Quelle'],
  ['Inspection view', 'დათვალიერების რეჟიმი', 'Ansicht wählen'],
  ['Zoom out', 'დაპატარავება', 'Verkleinern'],
  ['Zoom in', 'გადიდება', 'Vergrößern'],
  ['Reset', 'საწყისი მდგომარეობა', 'Zurücksetzen'],
  ['THE MACHINE', 'ავტომობილი', 'DIE MASCHINE'],
  ['FACTORY ENGINE', 'ქარხნული ძრავა', 'WERKSMOTOR'],
  ['Inspect the engine', 'დაათვალიერეთ ძრავა', 'Motor erkunden'],
  ['Real photographs.', 'რეალური ფოტოები.', 'Echte Fotografien.'],
  ['Verified factory specifications.', 'გადამოწმებული ქარხნული მახასიათებლები.', 'Geprüfte Werksdaten.'],
  ['UNDER THE HOOD', 'კაპოტქვეშ', 'UNTER DER MOTORHAUBE'],
  ['Photograph angles', 'ფოტოების რაკურსები', 'Fotoperspektiven'],
  ['Previous photograph', 'წინა ფოტო', 'Vorheriges Foto'],
  ['Next photograph', 'შემდეგი ფოტო', 'Nächstes Foto'],
  ['Previous', 'წინა', 'Zurück'],
  ['Next', 'შემდეგი', 'Weiter'],
  ['Expand photo', 'ფოტოს გადიდება', 'Foto vergrößern'],
  ['Photograph unavailable. Choose another view.', 'ფოტო მიუწვდომელია. აირჩიეთ სხვა ხედი.', 'Foto nicht verfügbar. Wähle eine andere Ansicht.'],
  ['NO VERIFIED PHOTO', 'გადამოწმებული ფოტო არ არის', 'KEIN GEPRÜFTES FOTO'],
  ['No verified matching straight-on photo available', 'შესაბამისი გადამოწმებული პირდაპირი ფოტო არ არის', 'Keine geprüfte passende Direktansicht verfügbar'],
  ['Exact vehicle angles', 'ავტომობილის ზუსტი ხედები', 'Exakte Fahrzeugansichten'],
  ['Front', 'წინიდან', 'Vorne'],
  ['Rear', 'უკნიდან', 'Hinten'],
  ['Left', 'მარცხნიდან', 'Links'],
  ['Right', 'მარჯვნიდან', 'Rechts'],
  ['Top', 'ზემოდან', 'Oben'],
  ['Underside', 'ქვემოდან', 'Unterboden'],
  ['Engine reference', 'ძრავის საცნობარო ფოტო', 'Motorreferenz'],
  ['Photo source', 'ფოტოს წყარო', 'Fotoquelle'],
  ['Factory specifications', 'ქარხნული მახასიათებლები', 'Werksdaten'],
  ['FACTORY POWER', 'ქარხნული სიმძლავრე', 'WERKSLEISTUNG'],
  ['FACTORY TORQUE', 'ქარხნული ბრუნვის მომენტი', 'WERKSDREHMOMENT'],
  ['ENGINE LAYOUT', 'ძრავის განლაგება', 'MOTORBAUART'],
  ['INDUCTION', 'ჰაერის მიწოდება', 'AUFLADUNG'],
  ['Factory data', 'ქარხნული მონაცემები', 'Werksdaten'],
  ['BMW factory source', 'BMW-ის ქარხნული წყარო', 'BMW Werksquelle'],
  ['factory', 'ქარხნული', 'Werk'],
  ['THE SOUND', 'ჟღერადობა', 'DER KLANG'],
  ['Sound', 'ხმის', 'Sound'],
  ['studio.', 'სტუდია.', 'Studio.'],
  ['Real recordings', 'ნამდვილი ჩანაწერები', 'Echte Aufnahmen'],
  ['Interactive engine', 'ინტერაქტიული ძრავა', 'Interaktiver Motor'],
  ['SIMULATED SOUND', 'სიმულირებული ხმა', 'SIMULIERTER KLANG'],
  ['ORIGINAL VIDEO / REAL CAR AUDIO', 'ორიგინალი ვიდეო / ავტომობილის ნამდვილი ხმა', 'ORIGINALVIDEO / ECHTER FAHRZEUGKLANG'],
  ['REAL CAR RECORDING', 'ავტომობილის ნამდვილი ჩანაწერი', 'ECHTE FAHRZEUGAUFNAHME'],
  ['ENGINE-FAMILY REFERENCE', 'ძრავის ოჯახის საცნობარო ჩანაწერი', 'REFERENZ DER MOTORFAMILIE'],
  ['Matching recording unavailable', 'შესაბამისი ჩანაწერი მიუწვდომელია', 'Keine passende Aufnahme verfügbar'],
  ['Original creator recording', 'ავტორის ორიგინალი ჩანაწერი', 'Originalaufnahme des Urhebers'],
  ['Play recording', 'ჩანაწერის ჩართვა', 'Aufnahme abspielen'],
  ['Stop recording', 'ჩანაწერის შეჩერება', 'Aufnahme stoppen'],
  ['Watch original', 'ორიგინალის ნახვა', 'Original ansehen'],
  ['START ENGINE', 'ძრავის გაშვება', 'MOTOR STARTEN'],
  ['STOP ENGINE', 'ძრავის გამორთვა', 'MOTOR STOPPEN'],
  ['STARTING…', 'მიმდინარეობს გაშვება…', 'STARTET…'],
  ['ENGINE OFF', 'ძრავა გამორთულია', 'MOTOR AUS'],
  ['OFF', 'გამორთულია', 'AUS'],
  ['STARTING', 'გაშვება', 'STARTET'],
  ['IDLE', 'უქმი სვლა', 'LEERLAUF'],
  ['RUNNING', 'მუშაობს', 'LÄUFT'],
  ['REV', 'ბრუნვის მომატება', 'HOCHDREHEN'],
  ['THROTTLE', 'აქსელერატორი', 'GAS'],
  ['FULL', 'მაქსიმუმი', 'VOLLGAS'],
  ['HOLD TO REV', 'დააჭირეთ და გააჩერეთ', 'ZUM HOCHDREHEN HALTEN'],
  ['SIMULATED ENGINE SOUND', 'ძრავის სიმულირებული ხმა', 'SIMULIERTER MOTORKLANG'],
  ['VOLUME', 'ხმის დონე', 'LAUTSTÄRKE'],
  ['Use headphones for the layered sound', 'მრავალშრიანი ხმისთვის გამოიყენეთ ყურსასმენები', 'Für den mehrschichtigen Klang Kopfhörer verwenden'],
  ['Mute', 'ხმის გათიშვა', 'Stummschalten'],
  ['Unmute', 'ხმის ჩართვა', 'Ton einschalten'],
  ['Start simulated engine', 'სიმულირებული ძრავის გაშვება', 'Simulierten Motor starten'],
  ['Stop simulated engine', 'სიმულირებული ძრავის გამორთვა', 'Simulierten Motor stoppen'],
  ['Preparing engine sound…', 'ძრავის ხმის მომზადება…', 'Motorklang wird vorbereitet…'],
  ['Start the engine, then hold REV or move the throttle.', 'გაუშვით ძრავა, შემდეგ გააჩერეთ REV ღილაკი ან გადაადგილეთ აქსელერატორი.', 'Starte den Motor und halte REV oder bewege den Gasregler.'],
  ['Start the engine, then hold REV or move the throttle. Release to settle back to idle.', 'გაუშვით ძრავა, შემდეგ გააჩერეთ REV ღილაკი ან გამოიყენეთ აქსელერატორი. გაუშვით ხელი უქმ სვლაზე დასაბრუნებლად.', 'Starte den Motor und halte REV oder bewege den Gasregler. Loslassen führt zurück zum Leerlauf.'],
  ['Engine running. Hold REV or use the throttle; release to return to your slider setting.', 'ძრავა მუშაობს. გააჩერეთ REV ან გამოიყენეთ აქსელერატორი; ხელის გაშვებით დაბრუნდებით არჩეულ დონეზე.', 'Der Motor läuft. Halte REV oder nutze den Gasregler. Beim Loslassen gilt wieder deine Reglereinstellung.'],
  ['Sound follows the displayed RPM.', 'ხმა ეკრანზე ნაჩვენებ ბრუნვას მიჰყვება.', 'Der Klang folgt der angezeigten Drehzahl.'],
  ['Naturally aspirated engine: induction and exhaust sound, with no turbo layer.', 'ატმოსფერული ძრავა: შეშვებისა და გამონაბოლქვის ხმა ტურბოს გარეშე.', 'Saugmotor: Ansaug- und Abgasklang ohne Turboschicht.'],
  ['UNDERSTAND THE MACHINE', 'გაიცანით მექანიზმი', 'DIE TECHNIK VERSTEHEN'],
  ['Car', 'ავტომობილის', 'Fahrzeug'],
  ['parts.', 'ნაწილები.', 'teile.'],
  ['Search components', 'კომპონენტების ძიება', 'Komponenten suchen'],
  ['Search turbo, cooling, battery…', 'მოძებნეთ ტურბო, გაგრილება, ბატარეა…', 'Turbo, Kühlung, Batterie suchen…'],
  ['BMW family examples', 'BMW-ის ძრავის ოჯახები', 'BMW Motorfamilien'],
  ['All families', 'ყველა ოჯახი', 'Alle Motorfamilien'],
  ['No matching components', 'შესაბამისი კომპონენტი ვერ მოიძებნა', 'Keine passenden Komponenten gefunden'],
  ['Try a different component or select All families.', 'სცადეთ სხვა კომპონენტი ან აირჩიეთ ყველა ოჯახი.', 'Versuche eine andere Komponente oder wähle alle Motorfamilien.'],
  ['Identify real components from clear photographs. Select a part to learn its location, connections and purpose.', 'ამოიცანით რეალური კომპონენტები მკაფიო ფოტოებით. აირჩიეთ ნაწილი მისი მდებარეობის, კავშირებისა და დანიშნულების გასაგებად.', 'Erkenne echte Komponenten auf klaren Fotos. Wähle ein Teil, um mehr über Position, Anschlüsse und Funktion zu erfahren.'],
  ['Where it is', 'სად მდებარეობს', 'Wo es sitzt'],
  ['What it is for', 'რა დანიშნულება აქვს', 'Wofür es da ist'],
  ['How it works', 'როგორ მუშაობს', 'Wie es funktioniert'],
  ['What it connects to', 'რას უკავშირდება', 'Womit es verbunden ist'],
  ['Possible fault symptoms', 'გაუმართაობის შესაძლო ნიშნები', 'Mögliche Fehlersymptome'],
  ['Design and BMW differences', 'კონსტრუქცია და BMW-ის თავისებურებები', 'Bauweise und BMW Besonderheiten'],
  ['BMW system examples', 'BMW-ის სისტემების მაგალითები', 'BMW Systembeispiele'],
  ['Technical references', 'ტექნიკური წყაროები', 'Technische Quellen'],
  ['Look for', 'ამოიცანით', 'Achte auf'],
  ['Open full-resolution photo', 'სრული გარჩევადობის ფოტოს გახსნა', 'Foto in voller Auflösung öffnen'],
  ['Explore turbo types →', 'აღმოაჩინეთ ტურბოს ტიპები →', 'Turboladertypen entdecken →'],
  ['Turbocharger', 'ტურბოკომპრესორი', 'Turbolader'],
  ['Engine air filter', 'ძრავის ჰაერის ფილტრი', 'Motorluftfilter'],
  ['Spark plug', 'ანთების სანთელი', 'Zündkerze'],
  ['Ignition coil', 'ანთების კოჭა', 'Zündspule'],
  ['Fuel injector', 'საწვავის ინჟექტორი', 'Einspritzventil'],
  ['Alternator', 'გენერატორი', 'Lichtmaschine'],
  ['Throttle body', 'დროსელის კორპუსი', 'Drosselklappengehäuse'],
  ['Brake caliper', 'სამუხრუჭე სუპორტი', 'Bremssattel'],
  ['Air & exhaust', 'ჰაერი და გამონაბოლქვი', 'Luft und Abgas'],
  ['Air & intake', 'ჰაერი და შეშვება', 'Luft und Ansaugung'],
  ['Ignition', 'ანთება', 'Zündung'],
  ['Fuel delivery', 'საწვავის მიწოდება', 'Kraftstoffversorgung'],
  ['Electrical', 'ელექტროსისტემა', 'Elektrik'],
  ['Brakes', 'მუხრუჭები', 'Bremsen'],
  ['BMW B58 component', 'BMW B58-ის კომპონენტი', 'BMW B58 Komponente'],
  ['Generic reference', 'ზოგადი საცნობარო ფოტო', 'Allgemeines Referenzfoto'],
  ['Cut-open reference', 'გაჭრილი კომპონენტის ფოტო', 'Aufgeschnittene Referenz'],
  ['Electrical section', 'ელექტრული ნაწილის ჭრილი', 'Elektrischer Querschnitt'],
  ['Uses exhaust energy to compress the air entering the engine.', 'იყენებს გამონაბოლქვის ენერგიას ძრავში შემავალი ჰაერის შესაკუმშად.', 'Nutzt Abgasenergie, um die in den Motor eintretende Luft zu verdichten.'],
  ['Traps dust and dirt before intake air enters the engine.', 'აკავებს მტვერსა და ჭუჭყს ჰაერის ძრავში შესვლამდე.', 'Hält Staub und Schmutz zurück, bevor die Ansaugluft den Motor erreicht.'],
  ['Creates the spark that ignites the air-fuel mixture.', 'ქმნის ნაპერწკალს, რომელიც ჰაერისა და საწვავის ნარევს აალებს.', 'Erzeugt den Funken, der das Luft-Kraftstoff-Gemisch entzündet.'],
  ['Converts low-voltage electrical energy into the high voltage needed for a spark.', 'დაბალი ძაბვის ელექტროენერგიას გარდაქმნის ნაპერწკლისთვის საჭირო მაღალ ძაბვად.', 'Wandelt niedrige Spannung in die für den Zündfunken erforderliche Hochspannung um.'],
  ['Meters and sprays fuel into the engine’s air supply or combustion chamber.', 'ზომავს და აფრქვევს საწვავს შეშვების სისტემაში ან წვის კამერაში.', 'Dosiert Kraftstoff und spritzt ihn in den Ansaugtrakt oder Brennraum ein.'],
  ['Generates electricity and charges the battery while the engine runs.', 'ძრავის მუშაობისას გამოიმუშავებს ელექტროენერგიას და მუხტავს ბატარეას.', 'Erzeugt bei laufendem Motor Strom und lädt die Batterie.'],
  ['Changes the intake passage opening using a movable throttle plate.', 'მოძრავი დროსელის ფირფიტით ცვლის შეშვების არხის გახსნას.', 'Verändert den Öffnungsquerschnitt im Ansaugtrakt mit einer beweglichen Drosselklappe.'],
  ['Uses hydraulic pressure to squeeze the pads against the brake disc.', 'ჰიდრავლიკური წნევით აჭერს ხუნდებს სამუხრუჭე დისკზე.', 'Presst die Bremsbeläge mit hydraulischem Druck gegen die Bremsscheibe.'],
  ['INDUCTION / THE FIELD GUIDE', 'ჰაერის მიწოდება / გზამკვლევი', 'AUFLADUNG / DER LEITFADEN'],
  ['Know your', 'გაიცანით თქვენი', 'Verstehe deinen'],
  ['turbo.', 'ტურბო.', 'Turbo.'],
  ['Seven ways to understand what is under the hood.', 'შვიდი გზა კაპოტქვეშ არსებული ტექნიკის გასაგებად.', 'Sieben Wege, die Technik unter der Motorhaube zu verstehen.'],
  ['Choose a turbo type', 'აირჩიეთ ტურბოს ტიპი', 'Turboladertyp wählen'],
  ['Single turbo', 'ერთი ტურბო', 'Einzelner Turbolader'],
  ['Twin turbo', 'ორი ტურბო', 'Zwei Turbolader'],
  ['Twin-scroll', 'ორხვეულიანი ტურბინა', 'Twin-Scroll'],
  ['Sequential', 'თანმიმდევრული ჩართვა', 'Sequenzielle Aufladung'],
  ['Compound / two-stage', 'კასკადური / ორსაფეხურიანი', 'Verbund- / Zweistufenaufladung'],
  ['Variable geometry', 'ცვლადი გეომეტრია', 'Variable Turbinengeometrie'],
  ['Electrically assisted', 'ელექტრული დამხმარით', 'Elektrisch unterstützt'],
  ['One turbocharger', 'ერთი ტურბოკომპრესორი', 'Ein Turbolader'],
  ['NUMBER OF TURBOS', 'ტურბოების რაოდენობა', 'ANZAHL DER TURBOLADER'],
  ['NUMBER & ARRANGEMENT', 'რაოდენობა და განლაგება', 'ANZAHL UND ANORDNUNG'],
  ['TURBINE HOUSING', 'ტურბინის კორპუსი', 'TURBINENGEHÄUSE'],
  ['ACTIVATION STRATEGY', 'ჩართვის სტრატეგია', 'ZUSCHALTSTRATEGIE'],
  ['COMPRESSOR ARRANGEMENT', 'კომპრესორების განლაგება', 'VERDICHTERANORDNUNG'],
  ['TURBINE CONTROL', 'ტურბინის მართვა', 'TURBINENREGELUNG'],
  ['SHAFT ASSISTANCE', 'ლილვის დამხმარე ამძრავი', 'WELLENUNTERSTÜTZUNG'],
  ['Two turbos · parallel layout', 'ორი ტურბო · პარალელური სქემა', 'Zwei Turbolader · parallel'],
  ['Two exhaust passages per turbo', 'ორი გამონაბოლქვის არხი თითო ტურბოზე', 'Zwei Abgaskanäle pro Turbolader'],
  ['Turbos brought in progressively', 'ტურბოები ერთვება ეტაპობრივად', 'Turbolader werden stufenweise zugeschaltet'],
  ['Compression in series', 'თანმიმდევრული შეკუმშვა', 'Verdichtung in Reihe'],
  ['The trade-off', 'უპირატესობები და შეზღუდვები', 'Der Kompromiss'],
  ['Manufacturer explanation ↗', 'მწარმოებლის განმარტება ↗', 'Erklärung des Herstellers ↗'],
  ['Additional reference ↗', 'დამატებითი წყარო ↗', 'Weitere Quelle ↗'],
  ['Functional schematic · not a physical layout or installation guide.', 'ფუნქციური სქემა · არ წარმოადგენს ფიზიკურ განლაგებას ან მონტაჟის ინსტრუქციას.', 'Funktionsschema · keine physische Anordnung oder Einbauanleitung.'],
  ['Technology reference. No matching BMW application is verified in this collection.', 'ტექნოლოგიის საცნობარო აღწერა. ამ კოლექციაში BMW-ზე შესაბამისი გამოყენება გადამოწმებული არ არის.', 'Technologische Referenz. Eine passende BMW Anwendung ist in dieser Kollektion nicht geprüft.'],
  ['Which turbo setup does my BMW use?', 'რა ტიპის ტურბოს იყენებს ჩემი BMW?', 'Welche Turboanordnung verwendet mein BMW?'],
  ['FACTORY DATA', 'ქარხნული მონაცემები', 'WERKSDATEN'],
  ['Verified examples from this collection. Engine generation matters.', 'გადამოწმებული მაგალითები ამ კოლექციიდან. ძრავის თაობას მნიშვნელობა აქვს.', 'Geprüfte Beispiele aus dieser Kollektion. Die Motorgeneration ist entscheidend.'],
  ['BMW / engine', 'BMW / ძრავა', 'BMW / Motor'],
  ['Turbo count', 'ტურბოების რაოდენობა', 'Anzahl der Turbolader'],
  ['Turbine housing', 'ტურბინის კორპუსი', 'Turbinengehäuse'],
  ['Factory reference', 'ქარხნული წყარო', 'Werksquelle'],
  ['BMW source ↗', 'BMW-ის წყარო ↗', 'BMW Quelle ↗'],
  ['One turbine. One compressor. One shaft.', 'ერთი ტურბინა. ერთი კომპრესორი. ერთი ლილვი.', 'Eine Turbine. Ein Verdichter. Eine Welle.'],
  ['Two turbochargers share the job.', 'სამუშაოს ორი ტურბოკომპრესორი ინაწილებს.', 'Zwei Turbolader teilen sich die Arbeit.'],
  ['Keep exhaust pulses apart.', 'გამონაბოლქვის იმპულსები ცალკე რჩება.', 'Abgasimpulse getrennt führen.'],
  ['Change which turbos work as demand rises.', 'დატვირთვის ზრდასთან ერთად იცვლება მოქმედი ტურბოები.', 'Mit steigendem Bedarf weitere Turbolader zuschalten.'],
  ['The air is compressed in two stages.', 'ჰაერი ორ საფეხურად იკუმშება.', 'Die Luft wird in zwei Stufen verdichtet.'],
  ['Adjust the exhaust path through the turbine.', 'ტურბინაში გამონაბოლქვის გზა რეგულირდება.', 'Den Abgasweg durch die Turbine anpassen.'],
  ['An electric motor helps spin the turbo.', 'ელექტროძრავა ტურბოს ბრუნვაში ეხმარება.', 'Ein Elektromotor unterstützt den Turbolader.'],
  ['Photos identify the pictured component. Most are non-BMW references; exact identity is shown in each detail panel. BMW examples describe systems, not verified part-number fitment.', 'ფოტოები ასახავს ნაჩვენებ კომპონენტს. უმეტესობა არ არის BMW-ის დეტალი; ზუსტი ვინაობა აღწერილია დეტალურ ფანჯარაში. BMW-ის მაგალითები ხსნის სისტემებს და არ ადასტურებს ნაწილის თავსებადობას.', 'Die Fotos zeigen das jeweils beschriebene Bauteil. Die meisten sind keine BMW Referenzen; die genaue Identität steht im Detailfenster. BMW Beispiele beschreiben Systeme und bestätigen keine Teilenummern-Kompatibilität.'],
  ['These links show related vehicle systems. They do not establish that the photographed part fits those BMWs.', 'ბმულები აჩვენებს ავტომობილის შესაბამის სისტემებს. ისინი არ ადასტურებს, რომ ფოტოზე ნაჩვენები ნაწილი ამ BMW-ებს ერგება.', 'Diese Links zeigen verwandte Fahrzeugsysteme. Sie bestätigen nicht, dass das abgebildete Teil in diese BMW passt.'],
  ['Intake', 'შეშვების სისტემა', 'Ansaugung'],
  ['Fuel', 'საწვავის სისტემა', 'Kraftstoff'],
  ['Cooling', 'გაგრილების სისტემა', 'Kühlung'],
  ['Exhaust', 'გამონაბოლქვის სისტემა', 'Abgasanlage'],
  ['Battery', 'ბატარეა', 'Batterie'],
  ['Electric motor', 'ელექტროძრავა', 'Elektromotor'],
  ['ABOUT APEX', 'APEX-ის შესახებ', 'ÜBER APEX'],
  ['Know what', 'გაიგეთ, რა', 'Verstehe, was'],
  ['drives it.', 'ამოძრავებს მას.', 'ihn antreibt.'],
  ['An independent BMW explorer for understanding the cars, engines and electric systems behind the badge.', 'დამოუკიდებელი BMW გზამკვლევი ემბლემის მიღმა არსებული ავტომობილების, ძრავებისა და ელექტროსისტემების გასაცნობად.', 'Ein unabhängiger BMW Explorer für die Fahrzeuge, Motoren und Elektrosysteme hinter dem Emblem.'],
  ['01 / THE CARS', '01 / ავტომობილები', '01 / DIE FAHRZEUGE'],
  ['02 / THE COMPONENTS', '02 / კომპონენტები', '02 / DIE KOMPONENTEN'],
  ['03 / THE ACCURACY', '03 / სიზუსტე', '03 / DIE GENAUIGKEIT'],
  ['Start with a real BMW.', 'დაიწყეთ ნამდვილი BMW-ით.', 'Beginne mit einem echten BMW.'],
  ['Learn the connections.', 'გაიცანით სისტემების კავშირები.', 'Verstehe die Zusammenhänge.'],
  ['Clear about what you see.', 'ზუსტად იცოდეთ, რას ხედავთ.', 'Klarheit darüber, was du siehst.'],
  ['Explore the cars', 'აღმოაჩინეთ ავტომობილები', 'Fahrzeuge entdecken'],
  ['Explore car parts', 'აღმოაჩინეთ კომპონენტები', 'Fahrzeugteile entdecken'],
  ['Sources & accuracy', 'წყაროები და სიზუსტე', 'Quellen und Genauigkeit'],
  ['Independent. Curious. Precise.', 'დამოუკიდებელი. ცნობისმოყვარე. ზუსტი.', 'Unabhängig. Neugierig. Präzise.'],
  ['Browse combustion models, SUVs and electric BMWs. Each vehicle links to its factory specification source. Generations, markets and engine families stay attached to the selected model.', 'დაათვალიერეთ შიგაწვის ძრავიანი მოდელები, SUV-ები და ელექტრო BMW-ები. თითოეულ ავტომობილს აქვს ქარხნული მონაცემების წყაროს ბმული. თაობა, ბაზარი და ძრავის ოჯახი ყოველთვის არჩეულ მოდელს შეესაბამება.', 'Entdecke Verbrenner, SUVs und elektrische BMW. Jedes Fahrzeug verlinkt seine Werksdaten. Baureihe, Markt und Motorfamilie bleiben dem ausgewählten Modell zugeordnet.'],
  ['Read model-specific explanations of intake, fuel, turbocharging, valve control, cooling and electric drive systems, then open the related vehicle to inspect its available photographs.', 'წაიკითხეთ მოდელებზე მორგებული ახსნა შეშვების, საწვავის, ტურბოს, სარქველების მართვის, გაგრილებისა და ელექტროამძრავის შესახებ. შემდეგ გახსენით შესაბამისი ავტომობილი მისი ფოტოების სანახავად.', 'Lies modellspezifische Erklärungen zu Ansaugung, Kraftstoff, Turboaufladung, Ventilsteuerung, Kühlung und Elektroantrieb. Öffne dann das Fahrzeug, um seine verfügbaren Fotos zu betrachten.'],
  ['Factory facts are separate from reference photographs, creator-built 3D exteriors and simulated sound. Missing verified views stay unavailable. Original creator recordings are separate from the interactive throttle.', 'ქარხნული მონაცემები გამიჯნულია საცნობარო ფოტოებისგან, ავტორების 3D ექსტერიერებისა და სიმულირებული ხმისგან. გადამოწმებული ხედის არარსებობა მკაფიოდ არის აღნიშნული. ავტორების ორიგინალი ჩანაწერები დამოუკიდებელია ინტერაქტიული აქსელერატორისგან.', 'Werksdaten werden von Referenzfotos, 3D Außenansichten der Urheber und simuliertem Klang unterschieden. Fehlende geprüfte Ansichten bleiben als nicht verfügbar gekennzeichnet. Originalaufnahmen sind vom interaktiven Gasregler getrennt.'],
  ['APEX is not affiliated with BMW. Interactive sound is illustrative, not an authentic recording of your exact vehicle. 3D exteriors are creator models, not factory CAD or verified mechanical internals.', 'APEX არ არის დაკავშირებული BMW-თან. ინტერაქტიული ხმა საილუსტრაციოა და არ წარმოადგენს ზუსტად თქვენი ავტომობილის ავთენტურ ჩანაწერს. 3D ექსტერიერები ავტორების ნამუშევრებია და არა ქარხნული CAD ან გადამოწმებული შიდა მექანიზმები.', 'APEX steht in keiner Verbindung zu BMW. Interaktiver Klang ist eine Illustration, keine authentische Aufnahme deines exakten Fahrzeugs. 3D Außenansichten sind Modelle von Urhebern, keine Werks-CAD-Daten oder geprüften mechanischen Innenansichten.'],
  ['Independent BMW explorer. Not affiliated with BMW.', 'დამოუკიდებელი BMW გზამკვლევი. BMW-თან არ არის დაკავშირებული.', 'Unabhängiger BMW Explorer. Keine Verbindung zu BMW.'],
  ['Image credits & accuracy', 'ფოტოების ავტორები და სიზუსტე', 'Bildnachweise und Genauigkeit'],
  ['Light theme', 'ღია თემა', 'Helles Design'],
  ['Dark theme', 'მუქი თემა', 'Dunkles Design'],
  ['System theme', 'სისტემის თემა', 'Systemdesign'],
  ['Switch to light theme', 'ღია თემაზე გადართვა', 'Zum hellen Design wechseln'],
  ['Switch to dark theme', 'მუქ თემაზე გადართვა', 'Zum dunklen Design wechseln'],
  ['Use system theme', 'სისტემის თემის გამოყენება', 'Systemdesign verwenden'],
];
const translations = new Map(copy.map(([en, ka, de]) => [en, { en, ka, de }]));
const originalCopy = new Map(copy.flatMap(([en, ka, de]) => [[ka, en], [de, en]]));
const interpolate = (text, vars = {}) => text.replace(/\{(\w+)\}/g, (match, key) => vars[key] == null ? match : String(vars[key]));

function originalText(value) {
  const trimmed = value.trim();
  const clean = trimmed.replace(/\s+/g, ' ');
  if (translations.has(clean)) return value;
  const original = originalCopy.get(clean);
  return original === undefined ? value : value.replace(trimmed, original);
}

export function t(key, vars = {}) {
  return interpolate(translations.get(key)?.[language] ?? key, vars);
}

export function translateText(value) {
  if (!value || language === 'en') return value;
  const trimmed = value.trim();
  const clean = trimmed.replace(/\s+/g, ' ');
  let output = translations.get(clean)?.[language];
  if (output === undefined) {
    let match;
    if ((match = clean.match(/^(\d+) MODELS$/))) output = language === 'ka' ? `${match[1]} მოდელი` : `${match[1]} MODELLE`;
    else if ((match = clean.match(/^(\d+) of (\d+) models(.*)$/))) output = (language === 'ka' ? `${match[1]} / ${match[2]} მოდელი` : `${match[1]} von ${match[2]} Modellen`) + match[3].replace(/ · (.+)$/, (_, filter) => ` · ${t(filter)}`);
    else if ((match = clean.match(/^(\d+) photographed components$/))) output = language === 'ka' ? `${match[1]} კომპონენტის ფოტო` : `${match[1]} fotografierte Komponenten`;
    else if ((match = clean.match(/^(Saved|Compare)\s*\(?([0-9]+)\)?$/))) output = `${t(match[1])} (${match[2]})`;
    else if ((match = clean.match(/^(.*) · unavailable$/))) output = `${t(match[1])} · ${language === 'ka' ? 'მიუწვდომელია' : 'nicht verfügbar'}`;
    else if ((match = clean.match(/^Published by (.+)$/))) output = `${language === 'ka' ? 'გამომქვეყნებელი:' : 'Veröffentlicht von'} ${match[1]}`;
    else if ((match = clean.match(/^3D model by (.+)$/))) output = `${language === 'ka' ? '3D მოდელის ავტორი:' : '3D Modell von'} ${match[1]}`;
    else if ((match = clean.match(/^Photo by (.+)$/))) output = `${language === 'ka' ? 'ფოტოს ავტორი:' : 'Foto von'} ${match[1]}`;
    else if ((match = clean.match(/^Learn about (.+)$/))) output = language === 'ka' ? `შეიტყვეთ მეტი: ${t(match[1])}` : `Mehr über ${t(match[1])} erfahren`;
    else if ((match = clean.match(/^Explore (.+) ↗$/))) output = `${language === 'ka' ? 'აღმოაჩინეთ' : 'Entdecken'} ${match[1]} ↗`;
    else if ((match = clean.match(/^(\d+) \/ ([A-Z &]+)$/))) output = `${match[1]} / ${t(match[2])}`;
    else if ((match = clean.match(/^View (.+) photograph$/))) output = language === 'ka' ? `ფოტოს ნახვა: ${t(match[1])}` : `Foto ansehen: ${t(match[1])}`;
    else if ((match = clean.match(/^(Save|Compare|Explore|Open|Remove) (BMW .+)$/))) output = `${t({Save:'Save to garage', Compare:'Add to comparison', Explore:'Explore model', Open:'Open model', Remove:'Remove'}[match[1]])}: ${match[2]}`;
    else if ((match = clean.match(/^Verified exact angles: (\d+) \/ 6\. Reference angles are labeled individually below\.$/))) output = language === 'ka' ? `გადამოწმებული ზუსტი ხედები: ${match[1]} / 6. საცნობარო ხედები ქვემოთ ცალ-ცალკეა მონიშნული.` : `Geprüfte exakte Ansichten: ${match[1]} / 6. Referenzansichten sind unten einzeln gekennzeichnet.`;
  }
  return output === undefined ? value : value.replace(trimmed, output);
}

const textSources = new WeakMap();
const attributeSources = new WeakMap();
const attributes = ['aria-label', 'title', 'placeholder'];
const excluded = 'script,style,code,pre,kbd,svg,[data-no-i18n],[translate="no"],textarea';
let observer;
let initialized = false;

function sourceTranslation(node, value, sourceMap) {
  const previous = sourceMap.get(node);
  const source = previous && previous.output === value ? previous.source : originalText(value);
  let output = translateText(source);
  // German compounds join across the original Car <span>parts.</span> emphasis.
  if (language === 'de' && source.trim() === 'Car' && node.parentElement?.matches('#partslibrary h2')) output = output.trimEnd();
  sourceMap.set(node, { source, output });
  return output;
}

function translateNode(node) {
  if (node.nodeType === 3) {
    if (!node.textContent.trim() || node.parentElement?.closest(excluded)) return;
    const translated = sourceTranslation(node, node.textContent, textSources);
    if (node.textContent !== translated) node.textContent = translated;
    return;
  }
  if (node.nodeType !== 1 || node.matches(excluded)) return;
  if (node.hasAttribute('data-i18n') && node.childElementCount === 0) {
    const source = node.dataset.i18n;
    const translated = t(source);
    if (node.textContent !== translated) node.textContent = translated;
    // Keep the English source when switching back after an explicit-key render.
    if (node.firstChild) textSources.set(node.firstChild, { source, output: translated });
  }
  let saved = attributeSources.get(node);
  if (!saved) { saved = {}; attributeSources.set(node, saved); }
  for (const attribute of attributes) {
    if (!node.hasAttribute(attribute)) continue;
    const value = node.getAttribute(attribute);
    const previous = saved[attribute];
    const source = previous && previous.output === value ? previous.source : originalText(value);
    const output = translateText(source);
    saved[attribute] = { source, output };
    if (value !== output) node.setAttribute(attribute, output);
  }
  for (const child of [...node.childNodes]) translateNode(child);
}

function observe() {
  observer?.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attributes });
}

export function translatePage() {
  if (!document.body) return;
  observer?.disconnect();
  translateNode(document.body);
  document.documentElement.lang = language;
  const select = document.getElementById('language-select');
  if (select) select.value = language;
  updateThemeButton();
  observe();
}

export function getLanguage() { return language; }
export function getTheme() { return theme; }

export function setLanguage(value, persist = true) {
  if (!languages.includes(value)) return;
  language = value;
  if (persist) writePreference(LANGUAGE_KEY, language);
  translatePage();
  window.dispatchEvent(new CustomEvent('apex:languagechange', { detail: { language } }));
}

function updateThemeButton() {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  const next = theme === 'system' ? 'Switch to light theme' : theme === 'light' ? 'Switch to dark theme' : 'Use system theme';
  const current = theme === 'system' ? 'System theme' : theme === 'light' ? 'Light theme' : 'Dark theme';
  button.dataset.mode = theme;
  button.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
  button.setAttribute('aria-label', `${t(current)}. ${t(next)}`);
  button.title = `${t(current)} · ${t(next)}`;
}

export function setTheme(value, persist = true) {
  if (!['light', 'dark', 'system'].includes(value)) return;
  theme = value;
  if (persist) writePreference(THEME_KEY, theme);
  const effective = value === 'system' ? (media?.matches ? 'dark' : 'light') : value;
  document.documentElement.dataset.theme = effective;
  document.documentElement.style.colorScheme = effective;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', effective === 'dark' ? '#080b10' : '#f5f6f8');
  updateThemeButton();
  window.dispatchEvent(new CustomEvent('apex:themechange', { detail: { theme, effective } }));
}

function init() {
  if (initialized) return;
  initialized = true;
  setTheme(theme, false);
  document.getElementById('language-select')?.addEventListener('change', event => setLanguage(event.target.value));
  document.getElementById('theme-toggle')?.addEventListener('click', () => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'));
  observer = new MutationObserver(records => {
    // Translate only the changed nodes. The live RPM display updates every frame.
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') {
        for (const node of record.addedNodes) if (node.isConnected) translateNode(node);
      } else if (record.type === 'attributes' && record.target.id !== 'theme-toggle') {
        translateNode(record.target);
      } else if (record.type === 'characterData') {
        translateNode(record.target);
      }
    }
    observe();
  });
  translatePage();
  const changed = () => { if (theme === 'system') setTheme('system', false); };
  if (media?.addEventListener) media.addEventListener('change', changed);
  else media?.addListener?.(changed);
  window.addEventListener('storage', event => {
    if (event.key === LANGUAGE_KEY) setLanguage(languages.includes(event.newValue) ? event.newValue : 'en', false);
    if (event.key === THEME_KEY) setTheme(['light', 'dark', 'system'].includes(event.newValue) ? event.newValue : 'system', false);
    if (event.key === null) { setLanguage('en', false); setTheme('system', false); }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
