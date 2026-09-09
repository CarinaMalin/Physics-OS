const formulaDetails = {
  'Geschwindigkeit': {
    formula:'v = Δs / Δt',
    when:'Für eine mittlere Geschwindigkeit über ein Zeitintervall. Für den momentanen Wert verwendet man im Grenzfall v = ds/dt.',
    variables:[['v','Geschwindigkeit','m/s'],['Δs','Ortsänderung','m'],['Δt','Zeitintervall','s']],
    rearrangements:[
      {target:'Δs',eq:'Δs = v · Δt',steps:['v = Δs / Δt','Beide Seiten mit Δt multiplizieren.','Δs = v · Δt']},
      {target:'Δt',eq:'Δt = Δs / v',steps:['v = Δs / Δt','Mit Δt multiplizieren: v · Δt = Δs','Durch v teilen: Δt = Δs / v']}
    ],
    example:{task:'150 m werden in 12 s zurückgelegt.',calc:'v = 150 m / 12 s = 12,5 m/s',result:'v = 12,5 m/s'},
    pitfall:'Δs ist eine Ortsänderung. Bei Richtungswechseln ist sie nicht automatisch gleich der gesamten zurückgelegten Strecke.',
    related:['Beschleunigung','Gleichmäßig beschleunigter Weg']
  },
  'Beschleunigung': {
    formula:'a = Δv / Δt',
    when:'Für die mittlere Beschleunigung während eines Zeitintervalls. Momentan gilt a = dv/dt.',
    variables:[['a','Beschleunigung','m/s²'],['Δv','Geschwindigkeitsänderung','m/s'],['Δt','Zeitintervall','s']],
    rearrangements:[
      {target:'Δv',eq:'Δv = a · Δt',steps:['a = Δv / Δt','Beide Seiten mit Δt multiplizieren.','Δv = a · Δt']},
      {target:'Δt',eq:'Δt = Δv / a',steps:['a = Δv / Δt','Mit Δt multiplizieren.','Durch a teilen: Δt = Δv / a']}
    ],
    example:{task:'Die Geschwindigkeit steigt in 4 s von 5 m/s auf 17 m/s.',calc:'a = (17 − 5) m/s / 4 s = 3 m/s²',result:'a = 3 m/s²'},
    pitfall:'Erst Δv bilden: Endgeschwindigkeit minus Anfangsgeschwindigkeit. Das Vorzeichen trägt physikalische Information.',
    related:['Geschwindigkeit','Newton II','Gleichmäßig beschleunigter Weg']
  },
  'Gleichmäßig beschleunigter Weg': {
    formula:'s = s₀ + v₀t + ½at²',
    when:'Für eindimensionale Bewegung mit konstanter Beschleunigung a.',
    variables:[['s','Ort zum Zeitpunkt t','m'],['s₀','Anfangsort','m'],['v₀','Anfangsgeschwindigkeit','m/s'],['a','konstante Beschleunigung','m/s²'],['t','Zeit','s']],
    rearrangements:[
      {target:'s₀',eq:'s₀ = s − v₀t − ½at²',steps:['s = s₀ + v₀t + ½at²','v₀t und ½at² auf beiden Seiten abziehen.','s₀ = s − v₀t − ½at²']},
      {target:'v₀',eq:'v₀ = (s − s₀ − ½at²) / t',steps:['s − s₀ = v₀t + ½at²','½at² abziehen.','Durch t teilen.']},
      {target:'a',eq:'a = 2(s − s₀ − v₀t) / t²',steps:['s − s₀ − v₀t = ½at²','Mit 2 multiplizieren.','Durch t² teilen.']},
      {target:'t',eq:'t = [−v₀ ± √(v₀² + 2a(s − s₀))] / a',steps:['Alles auf eine Seite bringen: ½at² + v₀t + (s₀ − s) = 0','Quadratische Lösungsformel anwenden.','Physikalisch passende Lösung wählen, häufig t ≥ 0.']}
    ],
    example:{task:'Start bei s₀ = 0, v₀ = 2 m/s, a = 3 m/s² und t = 4 s.',calc:'s = 0 + 2·4 + ½·3·4² = 8 + 24 = 32 m',result:'s = 32 m'},
    pitfall:'Diese Gleichung setzt konstantes a voraus. Beim Umstellen nach t entsteht eine quadratische Gleichung und es können zwei mathematische Lösungen existieren.',
    related:['Geschwindigkeit','Beschleunigung','Kinetische Energie']
  },
  'Newton II': {
    formula:'F = m · a',
    when:'Für die resultierende Kraft auf einen Körper. Streng genommen vektoriell: ΣF⃗ = m a⃗.',
    variables:[['F','resultierende Kraft','N'],['m','Masse','kg'],['a','Beschleunigung','m/s²']],
    rearrangements:[
      {target:'m',eq:'m = F / a',steps:['F = m · a','Beide Seiten durch a teilen.','m = F / a']},
      {target:'a',eq:'a = F / m',steps:['F = m · a','Beide Seiten durch m teilen.','a = F / m']}
    ],
    example:{task:'Eine Masse von 6 kg wird mit 2,5 m/s² beschleunigt.',calc:'F = 6 kg · 2,5 m/s² = 15 N',result:'F = 15 N'},
    pitfall:'Nicht eine einzelne Kraft einsetzen, wenn mehrere Kräfte wirken. Zuerst die resultierende Kraft bestimmen.',
    related:['Beschleunigung','Impuls','Zentripetalkraft']
  },
  'Impuls': {
    formula:'p = m · v',
    when:'Für den linearen Impuls eines Körpers in der klassischen Mechanik.',
    variables:[['p','Impuls','kg·m/s'],['m','Masse','kg'],['v','Geschwindigkeit','m/s']],
    rearrangements:[
      {target:'m',eq:'m = p / v',steps:['p = m · v','Durch v teilen.','m = p / v']},
      {target:'v',eq:'v = p / m',steps:['p = m · v','Durch m teilen.','v = p / m']}
    ],
    example:{task:'Ein Körper mit 3 kg bewegt sich mit 8 m/s.',calc:'p = 3 · 8 = 24 kg·m/s',result:'p = 24 kg·m/s'},
    pitfall:'Impuls ist eine Vektorgröße. In mehreren Dimensionen müssen die Komponenten bzw. Richtungen berücksichtigt werden.',
    related:['Newton II','Kinetische Energie','de-Broglie-Wellenlänge']
  },
  'Kinetische Energie': {
    formula:'Eₖ = ½mv²',
    when:'Für die translatorische Bewegungsenergie in der klassischen Mechanik.',
    variables:[['Eₖ','kinetische Energie','J'],['m','Masse','kg'],['v','Geschwindigkeitsbetrag','m/s']],
    rearrangements:[
      {target:'m',eq:'m = 2Eₖ / v²',steps:['Eₖ = ½mv²','Mit 2 multiplizieren: 2Eₖ = mv²','Durch v² teilen.']},
      {target:'v',eq:'v = √(2Eₖ / m)',steps:['2Eₖ = mv²','Durch m teilen: v² = 2Eₖ/m','Positive Wurzel für den Geschwindigkeitsbetrag ziehen.']}
    ],
    example:{task:'m = 4 kg und v = 5 m/s.',calc:'Eₖ = ½ · 4 · 5² = 50 J',result:'Eₖ = 50 J'},
    pitfall:'Die Geschwindigkeit wird quadriert. Doppelte Geschwindigkeit bedeutet vierfache kinetische Energie.',
    related:['Potentielle Energie','Arbeit','Impuls']
  },
  'Potentielle Energie': {
    formula:'Eₚ = mgh',
    when:'Für gravitative Lageenergie nahe einer Oberfläche, wenn g näherungsweise konstant ist.',
    variables:[['Eₚ','potentielle Energie','J'],['m','Masse','kg'],['g','Fallbeschleunigung','m/s²'],['h','Höhe relativ zum Nullniveau','m']],
    constants:'Auf der Erde nahe der Oberfläche: g ≈ 9,81 m/s².',
    rearrangements:[
      {target:'m',eq:'m = Eₚ / (gh)',steps:['Eₚ = mgh','Durch gh teilen.','m = Eₚ/(gh)']},
      {target:'g',eq:'g = Eₚ / (mh)',steps:['Eₚ = mgh','Durch mh teilen.','g = Eₚ/(mh)']},
      {target:'h',eq:'h = Eₚ / (mg)',steps:['Eₚ = mgh','Durch mg teilen.','h = Eₚ/(mg)']}
    ],
    example:{task:'2 kg werden um 5 m angehoben; g = 9,81 m/s².',calc:'Eₚ = 2 · 9,81 · 5 = 98,1 J',result:'Eₚ = 98,1 J'},
    pitfall:'h ist relativ zu einem frei gewählten Nullniveau. Für große Höhenänderungen ist g nicht mehr konstant.',
    related:['Kinetische Energie','Arbeit','Gravitationskraft']
  },
  'Arbeit': {
    formula:'W = ∫ F · ds',
    when:'Allgemein, wenn eine Kraft entlang eines Weges Energie überträgt. Für konstante Kraft gilt W = Fs cos θ.',
    variables:[['W','Arbeit','J'],['F','Kraft','N'],['s','Weg','m'],['θ','Winkel zwischen Kraft und Weg','° oder rad']],
    rearrangements:[
      {target:'F (konstant, parallel)',eq:'F = W / s',steps:['Für θ = 0 gilt W = F · s.','Durch s teilen.','F = W/s']},
      {target:'s (konstant, parallel)',eq:'s = W / F',steps:['W = F · s','Durch F teilen.','s = W/F']},
      {target:'F (mit Winkel)',eq:'F = W / (s cos θ)',steps:['W = Fs cos θ','Durch s cos θ teilen.','F = W/(s cos θ)']}
    ],
    example:{task:'Eine konstante parallele Kraft von 20 N wirkt über 3 m.',calc:'W = F·s = 20 · 3 = 60 J',result:'W = 60 J'},
    pitfall:'Die Integralform lässt sich nicht pauschal wie eine einfache Produktformel umstellen. Bei veränderlicher Kraft braucht man F(s).',
    related:['Kinetische Energie','Potentielle Energie','Newton II']
  },
  'Zentripetalkraft': {
    formula:'F = mv² / r',
    when:'Für die zum Kreismittelpunkt gerichtete resultierende Kraft bei Kreisbewegung.',
    variables:[['F','Zentripetalkraft','N'],['m','Masse','kg'],['v','Bahngeschwindigkeit','m/s'],['r','Bahnradius','m']],
    rearrangements:[
      {target:'m',eq:'m = Fr / v²',steps:['F = mv²/r','Mit r multiplizieren: Fr = mv²','Durch v² teilen.']},
      {target:'v',eq:'v = √(Fr / m)',steps:['Fr = mv²','Durch m teilen: v² = Fr/m','Wurzel ziehen.']},
      {target:'r',eq:'r = mv² / F',steps:['F = mv²/r','Mit r multiplizieren: Fr = mv²','Durch F teilen.']}
    ],
    example:{task:'m = 2 kg, v = 6 m/s, r = 4 m.',calc:'F = 2·6²/4 = 18 N',result:'F = 18 N'},
    pitfall:'Zentripetalkraft ist keine zusätzliche neue Kraftart. Sie bezeichnet die resultierende radiale Kraft.',
    related:['Newton II','Gravitationskraft']
  },
  'Ohmsches Gesetz': {
    formula:'U = R · I',
    when:'Für ohmsche Bauteile im linearen Bereich.',
    variables:[['U','Spannung','V'],['R','Widerstand','Ω'],['I','Stromstärke','A']],
    rearrangements:[
      {target:'R',eq:'R = U / I',steps:['U = R · I','Durch I teilen.','R = U/I']},
      {target:'I',eq:'I = U / R',steps:['U = R · I','Durch R teilen.','I = U/R']}
    ],
    example:{task:'U = 12 V und R = 30 Ω.',calc:'I = 12/30 = 0,4 A',result:'I = 0,4 A'},
    pitfall:'Nicht jedes Bauteil ist ohmsch; dann ist R nicht konstant.',
    related:['Elektrische Leistung']
  },
  'Elektrische Leistung': {
    formula:'P = U · I',
    when:'Für die elektrische Leistung eines Bauteils. Zusammen mit U = RI entstehen weitere nützliche Formen.',
    variables:[['P','Leistung','W'],['U','Spannung','V'],['I','Stromstärke','A'],['R','Widerstand','Ω']],
    rearrangements:[
      {target:'U',eq:'U = P / I',steps:['P = U · I','Durch I teilen.','U = P/I']},
      {target:'I',eq:'I = P / U',steps:['P = U · I','Durch U teilen.','I = P/U']},
      {target:'P mit R und I',eq:'P = I²R',steps:['P = UI','U = RI einsetzen.','P = (RI)I = I²R']},
      {target:'P mit U und R',eq:'P = U² / R',steps:['P = UI','I = U/R einsetzen.','P = U·U/R = U²/R']},
      {target:'R aus P und I',eq:'R = P / I²',steps:['P = I²R','Durch I² teilen.','R = P/I²']}
    ],
    example:{task:'U = 230 V und I = 0,5 A.',calc:'P = 230 · 0,5 = 115 W',result:'P = 115 W'},
    pitfall:'Watt ist Leistung, Joule ist Energie. Energie erhält man z. B. mit E = P·t.',
    related:['Ohmsches Gesetz']
  },
  'Coulomb-Kraft': {
    formula:'F = k · q₁q₂ / r²',
    when:'Für die elektrostatische Wechselwirkung idealisierter Punktladungen; k = 1/(4πε₀).',
    variables:[['F','Kraftbetrag','N'],['q₁, q₂','Ladungen','C'],['r','Abstand','m'],['k','Coulomb-Konstante','N·m²/C²']],
    constants:'k ≈ 8,987 551 792 × 10⁹ N·m²/C²; ε₀ ≈ 8,854 × 10⁻¹² F/m.',
    rearrangements:[
      {target:'q₁',eq:'q₁ = Fr² / (kq₂)',steps:['F = kq₁q₂/r²','Mit r² multiplizieren.','Durch kq₂ teilen.']},
      {target:'q₂',eq:'q₂ = Fr² / (kq₁)',steps:['F = kq₁q₂/r²','Mit r² multiplizieren.','Durch kq₁ teilen.']},
      {target:'r',eq:'r = √(k|q₁q₂| / |F|)',steps:['Für Beträge: |F|r² = k|q₁q₂|','Durch |F| teilen.','Wurzel ziehen.']}
    ],
    example:{task:'q₁ = q₂ = 1 µC, Abstand r = 0,10 m.',calc:'F ≈ 8,99·10⁹ · (10⁻⁶)² / 0,10² ≈ 0,899 N',result:'|F| ≈ 0,899 N'},
    pitfall:'Vorzeichen der Ladungen bestimmt die Richtung. Für den Abstand beim Umstellen arbeitet man mit Beträgen.',
    related:['Ohmsches Gesetz']
  },
  'Wellenbeziehung': {
    formula:'v = λf',
    when:'Für periodische Wellen: Ausbreitungsgeschwindigkeit = Wellenlänge × Frequenz.',
    variables:[['v','Ausbreitungsgeschwindigkeit','m/s'],['λ','Wellenlänge','m'],['f','Frequenz','Hz']],
    rearrangements:[
      {target:'λ',eq:'λ = v / f',steps:['v = λf','Durch f teilen.','λ = v/f']},
      {target:'f',eq:'f = v / λ',steps:['v = λf','Durch λ teilen.','f = v/λ']}
    ],
    example:{task:'Eine Welle läuft mit 340 m/s bei 680 Hz.',calc:'λ = 340/680 = 0,50 m',result:'λ = 0,50 m'},
    pitfall:'v ist im Allgemeinen vom Medium abhängig. Bei elektromagnetischen Wellen im Vakuum gilt v = c.',
    related:['Photonenenergie']
  },
  'Photonenenergie': {
    formula:'E = h · f',
    when:'Für die Energie eines einzelnen Photons.',
    variables:[['E','Photonenenergie','J'],['h','Planck-Konstante','J·s'],['f','Frequenz','Hz'],['λ','Wellenlänge','m']],
    constants:'h = 6,626 070 15 × 10⁻³⁴ J·s exakt; c = 299 792 458 m/s exakt.',
    rearrangements:[
      {target:'f',eq:'f = E / h',steps:['E = hf','Durch h teilen.','f = E/h']},
      {target:'E über λ',eq:'E = hc / λ',steps:['E = hf','Für Licht: f = c/λ','Einsetzen: E = h(c/λ) = hc/λ']},
      {target:'λ',eq:'λ = hc / E',steps:['E = hc/λ','Mit λ multiplizieren.','Durch E teilen: λ = hc/E']}
    ],
    example:{task:'Licht mit f = 5,0 × 10¹⁴ Hz.',calc:'E = 6,626·10⁻³⁴ · 5,0·10¹⁴ ≈ 3,31·10⁻¹⁹ J',result:'E ≈ 3,31 × 10⁻¹⁹ J'},
    pitfall:'Frequenz in Hz einsetzen. Bei Wellenlängen unbedingt auf Meter umrechnen, wenn SI-Einheiten verwendet werden.',
    related:['Wellenbeziehung','de-Broglie-Wellenlänge']
  },
  'de-Broglie-Wellenlänge': {
    formula:'λ = h / p',
    when:'Für die Materiewellenlänge eines Teilchens mit Impuls p.',
    variables:[['λ','de-Broglie-Wellenlänge','m'],['h','Planck-Konstante','J·s'],['p','Impuls','kg·m/s']],
    constants:'h = 6,626 070 15 × 10⁻³⁴ J·s.',
    rearrangements:[
      {target:'p',eq:'p = h / λ',steps:['λ = h/p','Mit p multiplizieren: λp = h','Durch λ teilen: p = h/λ']},
      {target:'h',eq:'h = λp',steps:['λ = h/p','Mit p multiplizieren.','h = λp']}
    ],
    example:{task:'Ein Teilchen hat p = 1,0 × 10⁻²⁴ kg·m/s.',calc:'λ = 6,626·10⁻³⁴ / 10⁻²⁴ ≈ 6,63·10⁻¹⁰ m',result:'λ ≈ 0,663 nm'},
    pitfall:'Für relativistische Teilchen muss p relativistisch bestimmt werden; λ = h/p bleibt aber gültig.',
    related:['Impuls','Photonenenergie']
  },
  'Ideale Gasgleichung': {
    formula:'pV = nRT',
    when:'Für ein ideales Gas bzw. reale Gase als Näherung bei geeigneten Bedingungen.',
    variables:[['p','Druck','Pa'],['V','Volumen','m³'],['n','Stoffmenge','mol'],['R','universelle Gaskonstante','J/(mol·K)'],['T','absolute Temperatur','K']],
    constants:'R ≈ 8,314 462 618 J/(mol·K).',
    rearrangements:[
      {target:'p',eq:'p = nRT / V',steps:['pV = nRT','Durch V teilen.','p = nRT/V']},
      {target:'V',eq:'V = nRT / p',steps:['pV = nRT','Durch p teilen.','V = nRT/p']},
      {target:'n',eq:'n = pV / (RT)',steps:['pV = nRT','Durch RT teilen.','n = pV/(RT)']},
      {target:'T',eq:'T = pV / (nR)',steps:['pV = nRT','Durch nR teilen.','T = pV/(nR)']}
    ],
    example:{task:'n = 1 mol, T = 300 K, V = 0,025 m³.',calc:'p = 1·8,314·300 / 0,025 ≈ 99 768 Pa',result:'p ≈ 99,8 kPa'},
    pitfall:'Temperatur immer in Kelvin. Einheiten müssen zur verwendeten Gaskonstante passen.',
    related:['Stefan–Boltzmann']
  },
  'Stefan–Boltzmann': {
    formula:'P = σAT⁴',
    when:'Für die gesamte abgestrahlte Leistung eines idealen schwarzen Körpers mit Oberfläche A.',
    variables:[['P','Strahlungsleistung','W'],['σ','Stefan-Boltzmann-Konstante','W/(m²·K⁴)'],['A','Fläche','m²'],['T','absolute Temperatur','K']],
    constants:'σ ≈ 5,670 374 419 × 10⁻⁸ W/(m²·K⁴).',
    rearrangements:[
      {target:'A',eq:'A = P / (σT⁴)',steps:['P = σAT⁴','Durch σT⁴ teilen.','A = P/(σT⁴)']},
      {target:'T',eq:'T = ⁴√(P / (σA))',steps:['P = σAT⁴','Durch σA teilen: T⁴ = P/(σA)','Vierte Wurzel ziehen.']},
      {target:'σ',eq:'σ = P / (AT⁴)',steps:['P = σAT⁴','Durch AT⁴ teilen.','σ = P/(AT⁴)']}
    ],
    example:{task:'Ein schwarzer Körper hat A = 1 m² und T = 1000 K.',calc:'P = 5,67·10⁻⁸ · 1 · 1000⁴ ≈ 56 704 W',result:'P ≈ 56,7 kW'},
    pitfall:'T steht in der vierten Potenz und muss in Kelvin eingesetzt werden.',
    related:['Wiensches Verschiebungsgesetz','Photonenenergie']
  },
  'Wiensches Verschiebungsgesetz': {
    formula:'λmax = b / T',
    when:'Für die Lage des Maximums im Wellenlängenspektrum eines schwarzen Körpers.',
    variables:[['λmax','Wellenlänge des Maximums','m'],['b','Wiensche Konstante','m·K'],['T','Temperatur','K']],
    constants:'b ≈ 2,897 771 955 × 10⁻³ m·K.',
    rearrangements:[
      {target:'T',eq:'T = b / λmax',steps:['λmax = b/T','Mit T multiplizieren.','Durch λmax teilen: T = b/λmax']},
      {target:'b',eq:'b = λmax · T',steps:['λmax = b/T','Mit T multiplizieren.','b = λmax T']}
    ],
    example:{task:'Die Sonne hat näherungsweise T = 5778 K.',calc:'λmax ≈ 2,898·10⁻³ / 5778 ≈ 5,02·10⁻⁷ m',result:'λmax ≈ 502 nm'},
    pitfall:'Dieses λmax gilt für die Darstellung pro Wellenlänge. Eine Darstellung pro Frequenz hat ein anderes Maximum.',
    related:['Stefan–Boltzmann','Photonenenergie']
  },
  'Gravitationskraft': {
    formula:'F = Gm₁m₂ / r²',
    when:'Für die Newtonsche Gravitation zwischen zwei punktförmig gedachten bzw. kugelsymmetrischen Massen.',
    variables:[['F','Gravitationskraft','N'],['G','Gravitationskonstante','N·m²/kg²'],['m₁, m₂','Massen','kg'],['r','Abstand der Schwerpunkte','m']],
    constants:'G ≈ 6,674 30 × 10⁻¹¹ N·m²/kg².',
    rearrangements:[
      {target:'m₁',eq:'m₁ = Fr² / (Gm₂)',steps:['F = Gm₁m₂/r²','Mit r² multiplizieren.','Durch Gm₂ teilen.']},
      {target:'m₂',eq:'m₂ = Fr² / (Gm₁)',steps:['F = Gm₁m₂/r²','Mit r² multiplizieren.','Durch Gm₁ teilen.']},
      {target:'r',eq:'r = √(Gm₁m₂ / F)',steps:['Fr² = Gm₁m₂','Durch F teilen.','Wurzel ziehen.']},
      {target:'G',eq:'G = Fr² / (m₁m₂)',steps:['F = Gm₁m₂/r²','Mit r² multiplizieren.','Durch m₁m₂ teilen.']}
    ],
    example:{task:'Für Erde und 1 kg Testmasse an der Erdoberfläche ergibt sich näherungsweise die Gewichtskraft.',calc:'F = GMₑm/Rₑ² ≈ 9,82 N',result:'F ≈ 9,82 N'},
    pitfall:'r ist der Abstand der Schwerpunkte, nicht die Höhe über der Oberfläche.',
    related:['Potentielle Energie','Fluchtgeschwindigkeit','Zentripetalkraft']
  },
  'Fluchtgeschwindigkeit': {
    formula:'vₑ = √(2GM / r)',
    when:'Für die minimale Startgeschwindigkeit zum Entkommen aus einem kugelsymmetrischen Gravitationsfeld ohne weiteren Antrieb.',
    variables:[['vₑ','Fluchtgeschwindigkeit','m/s'],['G','Gravitationskonstante','N·m²/kg²'],['M','Zentralmasse','kg'],['r','Abstand vom Zentrum','m']],
    constants:'Für die Erde an der Oberfläche: vₑ ≈ 11,2 km/s.',
    rearrangements:[
      {target:'M',eq:'M = vₑ²r / (2G)',steps:['vₑ = √(2GM/r)','Quadrieren: vₑ² = 2GM/r','Mit r multiplizieren und durch 2G teilen.']},
      {target:'r',eq:'r = 2GM / vₑ²',steps:['vₑ² = 2GM/r','Mit r multiplizieren.','Durch vₑ² teilen.']},
      {target:'G',eq:'G = vₑ²r / (2M)',steps:['vₑ² = 2GM/r','Mit r multiplizieren.','Durch 2M teilen.']}
    ],
    example:{task:'Erde: M ≈ 5,972·10²⁴ kg, r ≈ 6,371·10⁶ m.',calc:'vₑ = √(2GM/r) ≈ 11 186 m/s',result:'vₑ ≈ 11,2 km/s'},
    pitfall:'Das Modell ignoriert Atmosphäre, Rotation und weiteren Antrieb. r wird vom Zentrum des Himmelskörpers gemessen.',
    related:['Gravitationskraft']
  },
  'Lorentzfaktor': {
    formula:'γ = 1 / √(1 − v²/c²)',
    when:'In der speziellen Relativitätstheorie für Zeitdilatation, Längenkontraktion, relativistischen Impuls und Energie.',
    variables:[['γ','Lorentzfaktor','dimensionslos'],['v','Relativgeschwindigkeit','m/s'],['c','Lichtgeschwindigkeit','m/s']],
    constants:'c = 299 792 458 m/s exakt.',
    rearrangements:[
      {target:'v',eq:'v = c√(1 − 1/γ²)',steps:['γ = 1/√(1−v²/c²)','Kehrwert und quadrieren: 1/γ² = 1 − v²/c²','Umstellen: v²/c² = 1 − 1/γ²','Wurzel ziehen: v = c√(1−1/γ²)']},
      {target:'c',eq:'c = v / √(1 − 1/γ²)',steps:['v = c√(1−1/γ²)','Durch √(1−1/γ²) teilen.','c = v/√(1−1/γ²)']}
    ],
    example:{task:'v = 0,8c.',calc:'γ = 1/√(1−0,8²) = 1/0,6 ≈ 1,667',result:'γ ≈ 1,667'},
    pitfall:'γ ist immer ≥ 1. Für v ≥ c ist die Formel für massive Körper physikalisch nicht anwendbar.',
    related:['Photonenenergie']
  }
};

const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function installStyles(){
  if(document.getElementById('formula-enhancer-style')) return;
  const style=document.createElement('style');
  style.id='formula-enhancer-style';
  style.textContent=`
    #formulaModal .modal-card{width:min(900px,calc(100vw - 28px));max-height:min(86vh,900px);overflow:auto}
    .fx-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px;padding-right:38px}
    .fx-head h2{margin:5px 0 0}.fx-main-formula{font-size:clamp(26px,4vw,42px);font-weight:750;letter-spacing:-.03em;padding:18px 20px;border:1px solid var(--border,#27314a);background:rgba(108,126,255,.08);border-radius:16px;margin:12px 0 18px;overflow:auto}
    .fx-tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--border,#27314a);padding-bottom:10px;margin-bottom:18px}.fx-tab{border:0;background:transparent;color:var(--muted,#9ba7c1);padding:8px 11px;border-radius:9px;cursor:pointer}.fx-tab.active{background:rgba(111,132,255,.14);color:var(--text,#f5f7ff)}
    .fx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fx-box{padding:14px;border:1px solid var(--border,#27314a);border-radius:14px;background:rgba(255,255,255,.018)}.fx-box h4{margin:0 0 8px;font-size:13px}.fx-box p{margin:0;color:var(--muted,#9ba7c1);line-height:1.55}.fx-wide{grid-column:1/-1}
    .fx-vars{display:grid;gap:7px}.fx-var{display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}.fx-var:last-child{border:0}.fx-var b{font-size:17px}.fx-unit{font-size:12px;color:var(--muted,#9ba7c1)}
    .fx-rearrange{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07)}.fx-rearrange:last-child{border:0}.fx-target{display:flex;justify-content:space-between;gap:12px;align-items:center}.fx-equation{font-size:22px;font-weight:700;letter-spacing:-.02em}.fx-steps{margin-top:10px}.fx-steps summary{cursor:pointer;color:var(--accent,#8ea0ff);font-size:13px}.fx-steps ol{margin:10px 0 0 20px;padding:0;color:var(--muted,#9ba7c1);line-height:1.65}
    .fx-example{padding:18px;border-radius:16px;background:rgba(89,222,190,.06);border:1px solid rgba(89,222,190,.18)}.fx-example h3{margin-top:0}.fx-calc{font-size:20px;font-weight:700;margin:14px 0;line-height:1.5}.fx-result{display:inline-block;padding:8px 12px;border-radius:10px;background:rgba(89,222,190,.12);font-weight:700}
    .fx-related{display:flex;gap:8px;flex-wrap:wrap}.fx-related button{border:1px solid var(--border,#27314a);background:transparent;color:var(--text,#f5f7ff);padding:8px 10px;border-radius:999px;cursor:pointer}.fx-related button:hover{background:rgba(111,132,255,.1)}
    .fx-quiz{margin-top:18px;padding:15px;border:1px dashed rgba(111,132,255,.45);border-radius:14px}.fx-quiz-title{font-size:12px;color:var(--muted,#9ba7c1);text-transform:uppercase;letter-spacing:.08em}.fx-quiz strong{display:block;font-size:17px;margin:5px 0 10px}.fx-quiz details summary{cursor:pointer;color:var(--accent,#8ea0ff)}.fx-quiz .fx-equation{margin-top:10px}
    @media(max-width:700px){.fx-grid{grid-template-columns:1fr}.fx-wide{grid-column:auto}.fx-var{grid-template-columns:50px 1fr}.fx-unit{grid-column:2}.fx-head{padding-right:28px}}
  `;
  document.head.appendChild(style);
}

let activeFormulaName=null;
let activeTab='overview';

function openExtendedFormula(name,tab='overview'){
  const d=formulaDetails[name];
  if(!d) return false;
  activeFormulaName=name; activeTab=tab;
  renderExtendedFormula();
  $('#formulaModal')?.classList.remove('hidden');
  return true;
}

function renderExtendedFormula(){
  const d=formulaDetails[activeFormulaName];
  const root=$('#formulaDetail');
  if(!d||!root) return;
  const tabs=[['overview','Überblick'],['rearrange','Umstellen'],['example','Beispiel'],['links','Verknüpft']];
  root.innerHTML=`
    <div class="fx-head"><div><span class="tag">Formelwissen</span><h2>${esc(activeFormulaName)}</h2></div></div>
    <div class="fx-main-formula">${esc(d.formula)}</div>
    <div class="fx-tabs">${tabs.map(([id,label])=>`<button class="fx-tab ${activeTab===id?'active':''}" data-fx-tab="${id}">${label}</button>`).join('')}</div>
    <div id="fxBody">${renderTab(d,activeTab)}</div>`;
  root.querySelectorAll('[data-fx-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.fxTab;renderExtendedFormula()});
  root.querySelectorAll('[data-related]').forEach(b=>b.onclick=()=>openExtendedFormula(b.dataset.related,'overview'));
}

function renderTab(d,tab){
  if(tab==='overview') return `
    <div class="fx-grid">
      <div class="fx-box"><h4>Wann benutzen?</h4><p>${esc(d.when)}</p></div>
      <div class="fx-box"><h4>Typischer Stolperstein</h4><p>${esc(d.pitfall)}</p></div>
      <div class="fx-box fx-wide"><h4>Größen & Einheiten</h4><div class="fx-vars">${d.variables.map(v=>`<div class="fx-var"><b>${esc(v[0])}</b><span>${esc(v[1])}</span><span class="fx-unit">${esc(v[2])}</span></div>`).join('')}</div></div>
      ${d.constants?`<div class="fx-box fx-wide"><h4>Konstante / Merkwert</h4><p>${esc(d.constants)}</p></div>`:''}
    </div>`;
  if(tab==='rearrange'){
    const pick=d.rearrangements[Math.floor(Date.now()/1000)%d.rearrangements.length];
    return `<div class="fx-box fx-wide"><h4>Nach einer Größe auflösen</h4>${d.rearrangements.map(r=>`<div class="fx-rearrange"><div class="fx-target"><span>nach <b>${esc(r.target)}</b></span><span class="fx-equation">${esc(r.eq)}</span></div><details class="fx-steps"><summary>Rechenweg anzeigen</summary><ol>${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details></div>`).join('')}</div>
    <div class="fx-quiz"><div class="fx-quiz-title">Mini-Übung · ohne Zeitdruck</div><strong>Stelle die Ausgangsformel selbst nach ${esc(pick.target)} um.</strong><details><summary>Lösung prüfen</summary><div class="fx-equation">${esc(pick.eq)}</div></details></div>`;
  }
  if(tab==='example') return `<div class="fx-example"><h3>Beispielrechnung</h3><p>${esc(d.example.task)}</p><div class="fx-calc">${esc(d.example.calc)}</div><span class="fx-result">${esc(d.example.result)}</span></div>`;
  return `<div class="fx-grid"><div class="fx-box fx-wide"><h4>Verwandte Formeln</h4><div class="fx-related">${(d.related||[]).filter(n=>formulaDetails[n]).map(n=>`<button data-related="${esc(n)}">${esc(n)}</button>`).join('')||'<span class="subtle">Noch keine Verknüpfungen.</span>'}</div></div><div class="fx-box fx-wide"><h4>Lernidee</h4><p>Versuche zuerst die Umstellung selbst. Öffne den Rechenweg erst danach und prüfe, an welchem algebraischen Schritt du anders gedacht hast.</p></div></div>`;
}

function bindFormulaEnhancer(){
  installStyles();
  document.addEventListener('click',e=>{
    const card=e.target.closest?.('.formula-card');
    if(!card) return;
    const name=card.querySelector('h3')?.textContent?.trim();
    if(!formulaDetails[name]) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openExtendedFormula(name,'overview');
  },true);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindFormulaEnhancer);
else bindFormulaEnhancer();
