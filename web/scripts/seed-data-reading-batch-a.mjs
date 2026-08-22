// Reading content batch A: 10 original passages x 6 questions (60 questions).
// Written to match the format/tone of scripts/seed-data.mjs. Not yet merged into
// the main seed — merge readingPassagesBatchA into `passages` and
// readingQuestionsBatchA into `readingQuestions` there, then regenerate seed.sql.

export const readingPassagesBatchA = [
  {
    id: "p-photosynthesis",
    sectionSlug: "reading",
    title: "C4 Photosynthesis and Heat Tolerance",
    body: `Most plants rely on a photosynthetic pathway known as C3 photosynthesis, in which the enzyme RuBisCO fixes carbon dioxide directly into a three-carbon compound. This pathway works efficiently under moderate temperatures, but in hot, dry conditions, RuBisCO increasingly binds oxygen instead of carbon dioxide, a wasteful side reaction called photorespiration that reduces the energy available for growth.

A smaller group of plants, including maize, sugarcane, and sorghum, evolved an alternative called C4 photosynthesis. Rather than fixing carbon dioxide directly with RuBisCO, these plants first capture it in mesophyll cells using a different enzyme, converting it into a four-carbon compound that is then shuttled into specialized bundle sheath cells. There, the compound releases a concentrated dose of carbon dioxide directly around RuBisCO, effectively suppressing the conditions that lead to photorespiration.

This two-step process allows C4 plants to keep their leaf pores partially closed, conserving water, while still maintaining high rates of photosynthesis in hot, sunny climates. Notably, the C4 pathway is not the product of a single evolutionary event; it arose independently dozens of times across unrelated plant lineages, a striking example of convergent evolution. Although C4 species make up only a small fraction of all plant species, they include several staple crops responsible for a disproportionately large share of global agricultural yield, which has motivated ongoing research into engineering the C4 pathway into rice and other C3 crops.`,
  },
  {
    id: "p-bronze-age",
    sectionSlug: "reading",
    title: "The Bronze Age Collapse",
    body: `Around 1200 BCE, a number of powerful civilizations across the eastern Mediterranean and Near East, including the Hittite Empire, Mycenaean Greece, and numerous city-states along the Levantine coast, experienced a rapid and largely simultaneous decline within the span of a few decades. Major palace complexes were destroyed or abandoned, long-distance trade networks that had connected these societies collapsed, and writing systems used for administrative record-keeping disappeared in several regions for centuries afterward.

No single explanation has been universally accepted for this collapse, and most historians now argue that multiple stresses combined to overwhelm these interconnected societies. Written records from Egypt describe raids by groups referred to as the "Sea Peoples," whose origins remain uncertain, and archaeological evidence suggests waves of destruction along coastal settlements around this time. At the same time, climate records indicate a period of prolonged drought across the region, which likely strained agricultural production and contributed to famine and internal unrest.

The consequences of the collapse varied considerably by region. Egypt survived in a weakened form, while the Hittite Empire disappeared entirely, and Mycenaean palace culture gave way to a poorly documented period Greek historians later called a dark age. Because these Bronze Age societies had grown economically interdependent through trade in tin and other resources needed to produce bronze, the disruption of any single major trade route appears to have had consequences that rippled across the entire regional system.`,
  },
  {
    id: "p-loss-aversion",
    sectionSlug: "reading",
    title: "Loss Aversion in Behavioral Economics",
    body: `Classical economic theory long assumed that people evaluate financial decisions rationally, weighing potential gains and losses of equal size as equivalent in importance. Research in behavioral economics, however, has repeatedly shown that this assumption does not match how people actually behave. In a series of experiments beginning in the late 1970s, psychologists Daniel Kahneman and Amos Tversky demonstrated that people tend to feel the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain, a pattern they termed loss aversion.

This asymmetry helps explain behavior that appears puzzling under traditional economic models. Investors, for instance, often hold onto declining stocks far longer than a purely rational strategy would recommend, reluctant to "lock in" a loss by selling, even when the money could be better used elsewhere. Similarly, people frequently reject a fair coin-flip bet offering an equal chance of winning or losing the same amount of money, even though the expected value of accepting the bet is exactly zero.

Loss aversion has proven useful well beyond academic economics. Retailers frame limited-time discounts as an opportunity to avoid "losing out," which tends to be more motivating than framing the same offer as a potential gain. Policymakers designing programs to encourage retirement savings have applied similar insights, structuring default enrollment so that opting out feels like giving something up rather than declining to participate, a framing shown to significantly increase participation rates.`,
  },
  {
    id: "p-plate-tectonics",
    sectionSlug: "reading",
    title: "From Continental Drift to Plate Tectonics",
    body: `In 1912, the German meteorologist Alfred Wegener proposed that the continents had once been joined together in a single landmass, which he called Pangaea, before gradually drifting apart to their current positions. As evidence, he pointed to the way the coastlines of South America and Africa appeared to fit together like puzzle pieces, as well as matching rock formations and fossils of the same land-dwelling species found on continents now separated by vast oceans.

Despite this evidence, most geologists of the time rejected Wegener's theory, largely because he could not identify a plausible mechanism by which entire continents could plow through solid ocean floor. It was not until the 1950s and 1960s, with the development of new technology for mapping the ocean floor, that scientists discovered mid-ocean ridges where new crust was continuously forming and spreading outward, pushing older crust away on either side. This process, called seafloor spreading, provided the missing mechanism.

These discoveries were unified into the modern theory of plate tectonics, which describes Earth's rigid outer shell as broken into large plates that float atop a slowly deforming layer of the mantle beneath. Rather than continents plowing through ocean floor, entire plates, carrying both continents and ocean basins, move together at rates of only a few centimeters per year. This framework now explains not only continental drift but also the distribution of earthquakes, volcanoes, and mountain ranges along plate boundaries.`,
  },
  {
    id: "p-printing-press",
    sectionSlug: "reading",
    title: "The Printing Press and the Spread of Knowledge",
    body: `Around 1450, the German goldsmith Johannes Gutenberg introduced a printing system in Europe that combined movable metal type, an oil-based ink suited to metal surfaces, and a modified wine press to apply even pressure to paper. While woodblock printing and even earlier forms of movable type had existed in East Asia for centuries, Gutenberg's particular combination of technologies proved remarkably well suited to the alphabetic scripts used in Europe, since a relatively small set of reusable letter molds could be rearranged to print any text.

Before Gutenberg's press, books in Europe were copied by hand, a slow and expensive process that limited most texts to a small number of copies held by monasteries, universities, and wealthy patrons. Within decades of the press's introduction, printing workshops had spread to cities across Europe, and the cost of producing a book dropped dramatically, since a single set of type could produce hundreds or thousands of identical copies far faster than any scribe.

This sudden increase in the availability of printed material had consequences well beyond convenience. Standardized, widely available texts helped accelerate the spread of new scientific ideas, contributed to rising literacy rates as books became more affordable, and allowed religious reformers such as Martin Luther to distribute their writings far more quickly than earlier reform movements had been able to. Historians frequently cite the printing press as one of the most consequential inventions in shaping the intellectual and religious transformations of early modern Europe.`,
  },
  {
    id: "p-octopus",
    sectionSlug: "reading",
    title: "Octopus Cognition and Camouflage",
    body: `Octopuses possess a nervous system strikingly different from that of most intelligent animals studied by scientists. Rather than concentrating most neurons in a central brain, roughly two-thirds of an octopus's several hundred million neurons are distributed throughout its eight arms, allowing each arm to process sensory information and coordinate movement with a surprising degree of independence from the central brain. This distributed architecture has led some researchers to describe octopus cognition as fundamentally different from the centralized intelligence found in vertebrates.

This unusual nervous system supports one of the octopus's most remarkable abilities: near-instantaneous camouflage. Specialized skin cells called chromatophores, each containing an elastic sac of pigment, can expand or contract within a fraction of a second under direct neural control, allowing an octopus to alter its skin color and pattern to match its surroundings almost immediately. Beneath the chromatophores, additional cells called papillae can physically reshape the skin's texture, letting an octopus mimic not just the color but also the roughness of nearby coral, rock, or sand.

What makes this ability particularly puzzling is that octopuses are believed to be colorblind, lacking the color-sensitive cone cells found in the eyes of most camouflaging animals. Researchers have proposed that octopuses may instead sense color indirectly through light-sensitive proteins recently discovered in their skin itself, though how this information is processed quickly enough to guide such rapid camouflage remains an active area of research.`,
  },
  {
    id: "p-dust-bowl",
    sectionSlug: "reading",
    title: "The Dust Bowl of the 1930s",
    body: `During the 1930s, a series of severe dust storms struck the southern Great Plains region of the United States, an area encompassing parts of Texas, Oklahoma, Kansas, Colorado, and New Mexico that came to be known as the Dust Bowl. The storms stripped away millions of tons of topsoil, occasionally carrying dust as far as cities on the East Coast and darkening skies hundreds of miles from their point of origin.

The disaster resulted from a combination of natural drought and unsustainable farming practices. During the preceding decades, farmers had plowed under vast areas of native prairie grasses to plant wheat, encouraged by unusually wet years and rising wheat prices following the First World War. These deep-rooted grasses had historically anchored the soil and helped it retain moisture; without them, the exposed topsoil had little to hold it in place once a severe, multi-year drought began in 1931, and it was easily lifted by the strong winds that regularly swept across the plains.

The human toll was substantial: hundreds of thousands of families, unable to farm the ruined land or repay debts, abandoned their farms and migrated to other regions, particularly California, in search of work. In response, the federal government established programs to promote soil conservation, including techniques such as contour plowing and planting rows of trees as windbreaks, fundamentally changing agricultural practices across the Great Plains for decades afterward.`,
  },
  {
    id: "p-renaissance-patronage",
    sectionSlug: "reading",
    title: "The Renaissance Patronage System",
    body: `During the Italian Renaissance, artists rarely worked as independent creators producing pieces for open sale, as is common today. Instead, most operated within a patronage system, in which wealthy individuals, religious institutions, or civic governments commissioned specific works and paid for materials, labor, and often the artist's living expenses over the course of a project. A patron's commission typically specified not only the general subject matter but sometimes exact dimensions, materials such as expensive pigments like ultramarine, and even the number of figures to be included.

This arrangement shaped the direction of Renaissance art in significant ways. Wealthy banking families such as the Medici of Florence used patronage partly to display their wealth and reinforce their political influence, commissioning grand chapels, sculptures, and paintings that prominently featured their family emblems or even their own likenesses inserted into religious scenes. Because reputation and repeat commissions were essential to an artist's livelihood, artists had strong incentives to satisfy a patron's specific tastes and demands, even when those preferences constrained their creative choices.

The system also created intense competition among artists for prestigious commissions, since a single major project, such as decorating a cathedral dome or a civic building, could establish an artist's reputation for decades. This competitive pressure is credited with driving rapid technical innovation during the period, as artists sought to distinguish themselves through advances in techniques such as linear perspective and more naturalistic representations of the human body.`,
  },
  {
    id: "p-bird-navigation",
    sectionSlug: "reading",
    title: "How Migratory Birds Navigate",
    body: `Every year, many species of birds travel thousands of kilometers between breeding and wintering grounds, often returning to the same nesting site with remarkable precision despite having no apparent way to consult a map. For decades, researchers have investigated how migratory birds manage to navigate over such vast distances, and the current consensus is that birds rely not on a single method but on multiple, overlapping navigational systems.

One of the best-documented mechanisms is magnetoreception, the ability to detect Earth's magnetic field. Experiments have shown that certain birds can sense the angle at which magnetic field lines intersect the ground, effectively providing an internal compass that indicates direction without requiring visual landmarks. Researchers have proposed that this sense may depend on light-sensitive proteins in the birds' eyes that respond differently to Earth's magnetic field depending on its orientation, though the precise mechanism remains under investigation. Separately, many species also appear to use the position of the sun and stars, adjusting their orientation as celestial bodies move across the sky over the course of a journey.

Beyond directional senses, some species appear to build detailed mental maps of familiar landscapes using visual landmarks and even smell, particularly during the final stages of a journey when returning to a specific nesting site. Because young birds on their first migration often complete the journey successfully even without prior experience or adult guidance, researchers believe that at least some navigational abilities are innate rather than learned, though experience appears to refine navigation on subsequent migrations.`,
  },
  {
    id: "p-assembly-line",
    sectionSlug: "reading",
    title: "The Invention of the Assembly Line",
    body: `In 1913, Henry Ford's automobile company introduced a moving assembly line at its Highland Park, Michigan plant, fundamentally changing how manufactured goods were produced. Before this innovation, workers building a Ford automobile moved from station to station, carrying components and assembling entire vehicles largely by hand, a process that could take more than twelve hours per car. Ford's engineers instead arranged production so that a partially built car moved past stationary workers on a conveyor system, each of whom repeated a single specialized task as the vehicle passed.

The results were dramatic. By breaking down assembly into simple, repetitive steps and having components arrive exactly when and where needed, Ford's plant reduced the time required to build a single car to roughly ninety minutes. This gain in efficiency allowed Ford to lower the price of the Model T automobile substantially over the following years, even as it simultaneously increased wages for assembly line workers, in part to reduce the high turnover caused by the monotony of repetitive tasks.

The assembly line's influence extended far beyond the automobile industry. Manufacturers across numerous industries adopted similar principles of standardized parts, specialized labor, and continuous-flow production, a broader approach later termed mass production. While the assembly line dramatically increased output and lowered consumer prices, it also drew criticism for reducing skilled craftsmanship to repetitive, fragmented tasks, a tension between efficiency and worker experience that continues to shape debates about industrial labor today.`,
  },
];

function reading(id, passageId, stem, choices, correctIndex, explanation, difficulty = "medium") {
  return {
    id,
    sectionSlug: "reading",
    passageId,
    questionType: "reading_comprehension",
    stem,
    choices,
    correctIndex,
    explanation,
    difficulty,
  };
}

export const readingQuestionsBatchA = [
  reading(
    "q-read-photosynthesis-1",
    "p-photosynthesis",
    "What is the passage mainly about?",
    [
      "The chemical structure of RuBisCO",
      "How C4 photosynthesis helps certain plants cope with hot, dry conditions more efficiently than C3 photosynthesis",
      "The history of maize cultivation",
      "Methods for irrigating crops in arid regions",
    ],
    1,
    "本文はC4光合成の仕組みと、それが通常のC3光合成と比べてなぜ高温乾燥環境で有利になるのかを説明しています。"
  ),
  reading(
    "q-read-photosynthesis-2",
    "p-photosynthesis",
    "According to the passage, what problem does photorespiration cause in C3 plants?",
    [
      "It prevents leaf pores from closing",
      "It reduces the energy available for growth because RuBisCO binds oxygen instead of carbon dioxide",
      "It causes plants to lose their leaves",
      "It increases the rate of water loss through roots",
    ],
    1,
    "本文に \"a wasteful side reaction... that reduces the energy available for growth\" とあるように、RuBisCOが二酸化炭素の代わりに酸素と結合すると光呼吸が起こり、成長に使えるエネルギーが減少します。"
  ),
  reading(
    "q-read-photosynthesis-3",
    "p-photosynthesis",
    "The word \"suppressing\" in the passage is closest in meaning to",
    ["causing", "measuring", "preventing", "accelerating"],
    2,
    "\"Suppressing the conditions that lead to photorespiration\" は、光呼吸につながる条件が起こらないようにする、という意味です。"
  ),
  reading(
    "q-read-photosynthesis-4",
    "p-photosynthesis",
    "It can be inferred from the passage that C4 plants have an advantage over C3 plants primarily in",
    ["cold, cloudy climates", "hot, sunny, and relatively dry climates", "climates with very high rainfall only", "environments with no sunlight"],
    1,
    "本文はC4植物が \"hot, sunny climates\" でも光合成を維持しながら水分を節約できると説明しており、そのため高温で日差しの強い気候において有利になります。"
  ),
  reading(
    "q-read-photosynthesis-5",
    "p-photosynthesis",
    "The word \"these plants\" in paragraph 2 refers to",
    [
      "all plants that use C3 photosynthesis",
      "maize, sugarcane, and sorghum",
      "researchers studying photosynthesis",
      "plants found only in tropical rainforests",
    ],
    1,
    "第2段落の冒頭でトウモロコシ、サトウキビ、ソルガムがここで説明されているC4植物の例として挙げられています。"
  ),
  reading(
    "q-read-photosynthesis-6",
    "p-photosynthesis",
    "According to the passage, all of the following are mentioned as examples of C4 plants EXCEPT",
    ["maize", "sugarcane", "sorghum", "wheat"],
    3,
    "本文はトウモロコシ、サトウキビ、ソルガムをC4植物として挙げていますが、小麦については触れていません。"
  ),
  reading(
    "q-read-bronze-age-1",
    "p-bronze-age",
    "What is the passage mainly about?",
    [
      "The daily life of Mycenaean Greek citizens",
      "The likely causes and regional consequences of the Bronze Age Collapse",
      "The invention of bronze metallurgy",
      "A comparison between Egyptian and Hittite writing systems",
    ],
    1,
    "本文は青銅器時代の崩壊の考えられる原因と、その影響が地域によってどう異なったかを論じています。"
  ),
  reading(
    "q-read-bronze-age-2",
    "p-bronze-age",
    "According to the passage, what happened to writing systems in several regions after the collapse?",
    ["They were simplified but continued in use", "They disappeared for centuries", "They were replaced by a single universal script", "They were used only by the Sea Peoples"],
    1,
    "本文には文字体系が \"disappeared in several regions for centuries afterward\" とあります。"
  ),
  reading(
    "q-read-bronze-age-3",
    "p-bronze-age",
    "The word \"overwhelm\" in the passage is closest in meaning to",
    ["support", "explain", "exceed the capacity of", "postpone"],
    2,
    "\"Overwhelm these interconnected societies\" は、複合的なストレスがこれらの社会の許容範囲を超えたことを意味します。"
  ),
  reading(
    "q-read-bronze-age-4",
    "p-bronze-age",
    "It can be inferred from the passage that trade in tin was significant because",
    [
      "tin was used as currency across the region",
      "tin was needed to produce bronze, linking these societies economically",
      "tin was the primary food source for coastal populations",
      "tin mining caused the initial drought",
    ],
    1,
    "本文は各社会が \"grown economically interdependent through trade in tin and other resources needed to produce bronze\" と説明しており、錫の交易が経済的な結びつきを生んでいたことがわかります。"
  ),
  reading(
    "q-read-bronze-age-5",
    "p-bronze-age",
    "The word \"these societies\" in paragraph 2 refers to",
    ["modern historians", "the civilizations affected by the Bronze Age Collapse", "the Sea Peoples specifically", "only the Egyptian civilization"],
    1,
    "このフレーズは第1段落で説明されている、崩壊の影響を受けた文明を指しています。"
  ),
  reading(
    "q-read-bronze-age-6",
    "p-bronze-age",
    "According to the passage, all of the following are mentioned as factors or evidence related to the collapse EXCEPT",
    ["raids by the Sea Peoples", "a period of prolonged drought", "the disruption of trade networks", "a major volcanic eruption"],
    3,
    "本文は「海の民」による襲撃、長期の干ばつ、貿易網の崩壊に触れていますが、大規模な火山噴火については述べていません。"
  ),
  reading(
    "q-read-loss-aversion-1",
    "p-loss-aversion",
    "What is the passage mainly about?",
    [
      "The mathematical formula behind expected value",
      "How loss aversion causes people to deviate from purely rational economic behavior",
      "The biography of Daniel Kahneman",
      "Why retailers offer limited-time discounts",
    ],
    1,
    "本文は損失回避について説明し、それが合理的な経済モデルから外れた行動をどのように引き起こすかの例をいくつか挙げています。"
  ),
  reading(
    "q-read-loss-aversion-2",
    "p-loss-aversion",
    "According to the passage, what did Kahneman and Tversky find about how people experience losses and gains?",
    [
      "People feel gains and losses with equal intensity",
      "People feel the pain of a loss about twice as intensely as an equivalent gain",
      "People barely notice small financial losses",
      "People prefer losses to gains in most situations",
    ],
    1,
    "本文に \"feel the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain\" とあるように、人は損失の痛みを同額の利益の喜びの約2倍強く感じるとされています。"
  ),
  reading(
    "q-read-loss-aversion-3",
    "p-loss-aversion",
    "The word \"asymmetry\" in the passage is closest in meaning to",
    ["balance", "imbalance", "similarity", "calculation"],
    1,
    "損失と利益を感じる強さの違いは非対称性(asymmetry)、つまり不均衡として説明されています。"
  ),
  reading(
    "q-read-loss-aversion-4",
    "p-loss-aversion",
    "It can be inferred from the passage that an investor influenced by loss aversion would most likely",
    [
      "sell a losing stock immediately to avoid further risk",
      "hold onto a declining stock longer than a rational strategy would suggest",
      "refuse to invest in the stock market at all",
      "treat gains and losses exactly the same way",
    ],
    1,
    "本文には投資家が \"often hold onto declining stocks far longer than a purely rational strategy would recommend\" とあります。"
  ),
  reading(
    "q-read-loss-aversion-5",
    "p-loss-aversion",
    "The word \"which\" in paragraph 3, in the phrase \"which tends to be more motivating,\" refers to",
    [
      "offering a limited-time discount framed as a potential gain",
      "framing a limited-time discount as an opportunity to avoid losing out",
      "the retirement savings program",
      "the coin-flip bet described in paragraph 2",
    ],
    1,
    "この文は、損失を避ける機会として値引きを見せる方法(より動機づけになる)を、利益として見せる場合と対比しています。"
  ),
  reading(
    "q-read-loss-aversion-6",
    "p-loss-aversion",
    "According to the passage, all of the following are mentioned as examples influenced by loss aversion EXCEPT",
    [
      "investors holding onto declining stocks",
      "people rejecting a fair coin-flip bet",
      "retailers framing discounts around avoiding loss",
      "consumers preferring generic brands over name brands",
    ],
    3,
    "本文は投資家の行動、コイントスの賭け、小売業者の値引きの見せ方を例として挙げていますが、ブランドの好みについては触れていません。"
  ),
  reading(
    "q-read-plate-tectonics-1",
    "p-plate-tectonics",
    "What is the passage mainly about?",
    [
      "Alfred Wegener's personal life",
      "How the theory of continental drift evolved into the modern theory of plate tectonics",
      "The formation of mountain ranges specifically",
      "Methods used to predict earthquakes",
    ],
    1,
    "本文はウェゲナーの当初の理論から海洋底拡大の発見を経て現代のプレートテクトニクス理論に至る流れをたどっています。"
  ),
  reading(
    "q-read-plate-tectonics-2",
    "p-plate-tectonics",
    "According to the passage, why did most geologists initially reject Wegener's theory?",
    [
      "His evidence about coastlines was considered fabricated",
      "He could not identify a plausible mechanism for continents moving through solid ocean floor",
      "He refused to publish his findings",
      "Fossil evidence contradicted his theory",
    ],
    1,
    "本文には地質学者たちが理論を否定した理由として \"largely because he could not identify a plausible mechanism\" とあります。"
  ),
  reading(
    "q-read-plate-tectonics-3",
    "p-plate-tectonics",
    "The word \"plausible\" in the passage is closest in meaning to",
    ["impossible", "believable", "famous", "ancient"],
    1,
    "\"Plausible mechanism\" とは、信頼できる、説得力のある仕組みという意味です。"
  ),
  reading(
    "q-read-plate-tectonics-4",
    "p-plate-tectonics",
    "It can be inferred from the passage that the discovery of seafloor spreading was important because it",
    [
      "proved that continents do not move at all",
      "provided a mechanism that made continental drift scientifically credible",
      "disproved the existence of mid-ocean ridges",
      "showed that Pangaea never existed",
    ],
    1,
    "本文には海洋底拡大が \"provided the missing mechanism\" とあり、ウェゲナーの理論に欠けていた仕組みを補ったことがわかります。"
  ),
  reading(
    "q-read-plate-tectonics-5",
    "p-plate-tectonics",
    "The word \"This framework\" in paragraph 3 refers to",
    [
      "Wegener's original 1912 theory",
      "the technology used to map the ocean floor",
      "the modern theory of plate tectonics",
      "the distribution of fossils across continents",
    ],
    2,
    "\"This framework\" は、同じ段落の前半で説明されている現代のプレートテクトニクス理論を指しています。"
  ),
  reading(
    "q-read-plate-tectonics-6",
    "p-plate-tectonics",
    "According to the passage, all of the following are mentioned as evidence or phenomena related to plate tectonics EXCEPT",
    ["matching coastlines of South America and Africa", "mid-ocean ridges", "the distribution of earthquakes and volcanoes", "the discovery of a ninth continent"],
    3,
    "本文は一致する海岸線、海嶺(海洋底の中央海嶺)、地震・火山の分布について触れていますが、9番目の大陸の発見については述べていません。"
  ),
  reading(
    "q-read-printing-press-1",
    "p-printing-press",
    "What is the passage mainly about?",
    [
      "The biography of Johannes Gutenberg",
      "How the printing press transformed the production and spread of written knowledge in Europe",
      "The history of papermaking in East Asia",
      "The religious teachings of Martin Luther",
    ],
    1,
    "本文はグーテンベルクの印刷システムと、それがヨーロッパにおける知識の広がりに与えた幅広い影響を説明しています。"
  ),
  reading(
    "q-read-printing-press-2",
    "p-printing-press",
    "According to the passage, what technologies did Gutenberg combine in his printing system?",
    [
      "Woodblock carving and handwritten calligraphy",
      "Movable metal type, oil-based ink, and a modified wine press",
      "Paper made from wood pulp and a steam-powered press",
      "Movable type invented by Martin Luther",
    ],
    1,
    "本文には \"combined movable metal type, an oil-based ink suited to metal surfaces, and a modified wine press\" とあります。"
  ),
  reading(
    "q-read-printing-press-3",
    "p-printing-press",
    "The word \"accelerate\" in the passage is closest in meaning to",
    ["slow down", "speed up", "prevent", "record"],
    1,
    "\"Accelerate the spread of new scientific ideas\" は、その広がりを加速させる、という意味です。"
  ),
  reading(
    "q-read-printing-press-4",
    "p-printing-press",
    "It can be inferred from the passage that before the printing press, access to books was",
    [
      "available equally to all social classes",
      "limited mainly to monasteries, universities, and wealthy patrons",
      "restricted entirely to religious texts",
      "more widespread than after the printing press",
    ],
    1,
    "本文には手書きの写本が \"limited to a small number of copies held by monasteries, universities, and wealthy patrons\" とあります。"
  ),
  reading(
    "q-read-printing-press-5",
    "p-printing-press",
    "The word \"earlier reform movements\" in paragraph 3 is used to contrast with",
    [
      "the speed at which Martin Luther could distribute his writings using the printing press",
      "the invention of movable type in East Asia",
      "the wine press used by Gutenberg",
      "the rise in literacy rates",
    ],
    0,
    "本文は、印刷術を持たなかった以前の改革者たちと比べて、ルターが印刷術を使っていかに速く自分の著作を広められたかを対比しています。"
  ),
  reading(
    "q-read-printing-press-6",
    "p-printing-press",
    "According to the passage, all of the following are mentioned as effects of the printing press EXCEPT",
    ["a drop in the cost of producing books", "faster spread of scientific ideas", "rising literacy rates", "the abolition of monasteries"],
    3,
    "本文は書籍のコスト低下、科学的思想の広がりの加速、識字率の上昇に触れていますが、修道院の廃止については述べていません。"
  ),
  reading(
    "q-read-octopus-1",
    "p-octopus",
    "What is the passage mainly about?",
    [
      "The diet of wild octopuses",
      "The octopus's unusual nervous system and its role in rapid camouflage",
      "A comparison between octopuses and squid",
      "How chromatophores are used in human medical research",
    ],
    1,
    "本文はタコの分散型神経系と、それが素早い擬態をどう支えているかを説明しています。"
  ),
  reading(
    "q-read-octopus-2",
    "p-octopus",
    "According to the passage, where are roughly two-thirds of an octopus's neurons located?",
    ["In the central brain", "In the eyes", "Distributed throughout its eight arms", "In the skin's chromatophores"],
    2,
    "本文には \"roughly two-thirds of an octopus's several hundred million neurons are distributed throughout its eight arms\" とあります。"
  ),
  reading(
    "q-read-octopus-3",
    "p-octopus",
    "The word \"distributed\" in the passage is closest in meaning to",
    ["concentrated", "spread out", "removed", "duplicated"],
    1,
    "\"Distributed throughout its eight arms\" は、一箇所に集中せず8本の腕全体に広がっている、という意味です。"
  ),
  reading(
    "q-read-octopus-4",
    "p-octopus",
    "It can be inferred from the passage that octopus camouflage is puzzling to researchers mainly because",
    [
      "octopuses cannot move their arms independently",
      "octopuses appear to be colorblind yet can match colors in their environment",
      "chromatophores are found only in a few octopus species",
      "octopuses never change their skin texture",
    ],
    1,
    "本文はタコが \"are believed to be colorblind\" にもかかわらず周囲の色に合わせられる点が謎だと述べています。"
  ),
  reading(
    "q-read-octopus-5",
    "p-octopus",
    "The word \"this ability\" in paragraph 2 refers to",
    ["the octopus's distributed nervous system", "the octopus's near-instantaneous camouflage", "the octopus's sense of touch", "the octopus's diet"],
    1,
    "\"This ability\" は、第2段落の冒頭で紹介された、瞬時に近い擬態能力を指しています。"
  ),
  reading(
    "q-read-octopus-6",
    "p-octopus",
    "According to the passage, all of the following are mentioned as being involved in octopus camouflage EXCEPT",
    ["chromatophores", "papillae that reshape skin texture", "light-sensitive proteins in the skin", "color-sensitive cone cells in the eyes"],
    3,
    "本文はタコには色感受性の錐体細胞が欠けていると述べており、色素胞・乳頭・皮膚の光感受性タンパク質はいずれも擬態に関わるものとして挙げられています。"
  ),
  reading(
    "q-read-dust-bowl-1",
    "p-dust-bowl",
    "What is the passage mainly about?",
    ["The geography of the Great Plains", "The causes and consequences of the Dust Bowl", "The history of wheat prices in the United States", "Federal tax policy during the 1930s"],
    1,
    "本文はダストボウルの自然的・人為的な原因と、それが農家や政策に与えた影響を説明しています。"
  ),
  reading(
    "q-read-dust-bowl-2",
    "p-dust-bowl",
    "According to the passage, what practice contributed to the exposure of topsoil before the Dust Bowl?",
    [
      "Farmers planting deep-rooted prairie grasses",
      "Farmers plowing under native prairie grasses to plant wheat",
      "Farmers irrigating their fields excessively",
      "Farmers abandoning their land entirely",
    ],
    1,
    "本文には農家が \"had plowed under vast areas of native prairie grasses to plant wheat\" とあります。"
  ),
  reading(
    "q-read-dust-bowl-3",
    "p-dust-bowl",
    "The word \"anchored\" in the passage is closest in meaning to",
    ["loosened", "secured", "fertilized", "flooded"],
    1,
    "\"Anchored the soil\" は、土壌をしっかりと固定していた、という意味です。"
  ),
  reading(
    "q-read-dust-bowl-4",
    "p-dust-bowl",
    "It can be inferred from the passage that the Dust Bowl would have been less severe if",
    ["wheat prices had risen even further", "native prairie grasses had not been plowed under", "the drought had lasted only a single year", "more families had migrated to California"],
    1,
    "草原の草が土壌を固定し浸食を防いでいたため、それが耕されずに残っていればダストボウルの被害はより小さかったと考えられます。"
  ),
  reading(
    "q-read-dust-bowl-5",
    "p-dust-bowl",
    "The word \"them\" in paragraph 2, in the phrase \"without them,\" refers to",
    ["wheat farmers", "deep-rooted prairie grasses", "dust storms", "federal conservation programs"],
    1,
    "この文は、直前で述べられた深く根を張った草原の草が \"without\" だった場合に表土がどうなるかを説明しています。"
  ),
  reading(
    "q-read-dust-bowl-6",
    "p-dust-bowl",
    "According to the passage, all of the following are mentioned as responses to or causes of the Dust Bowl EXCEPT",
    ["a multi-year drought beginning in 1931", "plowing under native prairie grasses", "contour plowing and windbreak trees promoted by the government", "the construction of large-scale irrigation canals"],
    3,
    "本文は干ばつ、耕作の慣行、政府の土壌保全事業に触れていますが、大規模な灌漑用水路の建設については述べていません。"
  ),
  reading(
    "q-read-renaissance-patronage-1",
    "p-renaissance-patronage",
    "What is the passage mainly about?",
    [
      "The biography of the Medici family",
      "How the patronage system shaped the production and direction of Renaissance art",
      "The techniques used to create the pigment ultramarine",
      "A comparison between Renaissance and modern art markets",
    ],
    1,
    "本文はパトロン制度がルネサンス美術の制作内容や、芸術家同士の競争のあり方をどう形作ったかを説明しています。"
  ),
  reading(
    "q-read-renaissance-patronage-2",
    "p-renaissance-patronage",
    "According to the passage, what might a patron's commission specify?",
    [
      "Only the general subject matter, with no other requirements",
      "The artist's political opinions",
      "Exact dimensions, materials, and the number of figures to be included",
      "The exact selling price of the finished work",
    ],
    2,
    "本文には依頼内容が \"exact dimensions, materials such as expensive pigments... and even the number of figures to be included\" を指定しうるとあります。"
  ),
  reading(
    "q-read-renaissance-patronage-3",
    "p-renaissance-patronage",
    "The word \"constrained\" in the passage is closest in meaning to",
    ["expanded", "limited", "ignored", "rewarded"],
    1,
    "パトロンの好みが創作の選択を \"constrained\" したというのは、それらを制限したという意味です。"
  ),
  reading(
    "q-read-renaissance-patronage-4",
    "p-renaissance-patronage",
    "It can be inferred from the passage that Renaissance artists' creative choices were often influenced by",
    ["government censorship laws", "the specific preferences and demands of their patrons", "the absence of any competition among artists", "a complete lack of financial concerns"],
    1,
    "本文は芸術家が \"had strong incentives to satisfy a patron's specific tastes and demands\" と説明しています。"
  ),
  reading(
    "q-read-renaissance-patronage-5",
    "p-renaissance-patronage",
    "The word \"This arrangement\" in paragraph 2 refers to",
    ["the competition among artists for commissions", "the patronage system described in paragraph 1", "the technique of linear perspective", "the political structure of Florence"],
    1,
    "\"This arrangement\" は、第1段落で紹介されたパトロン制度を指しています。"
  ),
  reading(
    "q-read-renaissance-patronage-6",
    "p-renaissance-patronage",
    "According to the passage, all of the following are mentioned as motivations or effects related to patronage EXCEPT",
    ["displaying wealth and political influence", "driving technical innovation through competition", "satisfying a patron's specific tastes", "eliminating the need for skilled artists"],
    3,
    "本文は富や政治的影響力の誇示、競争による技術革新の促進、パトロンの好みを満たすことに触れていますが、熟練した芸術家の必要性をなくすことには触れておらず、むしろ本文の内容と矛盾します。"
  ),
  reading(
    "q-read-bird-navigation-1",
    "p-bird-navigation",
    "What is the passage mainly about?",
    [
      "The reasons birds migrate in the first place",
      "The multiple navigational systems migratory birds use to travel long distances",
      "The specific migration routes of one bird species",
      "How researchers tag birds for tracking studies",
    ],
    1,
    "本文は渡り鳥が長距離を移動する際に用いる、地磁気感知・天体の位置・記憶地図など複数の重なり合うナビゲーションの仕組みを説明しています。"
  ),
  reading(
    "q-read-bird-navigation-2",
    "p-bird-navigation",
    "According to the passage, what is magnetoreception?",
    ["The ability to see ultraviolet light", "The ability to detect Earth's magnetic field", "The ability to smell familiar landscapes", "The ability to remember visual landmarks"],
    1,
    "本文は磁気受容を \"the ability to detect Earth's magnetic field\" と定義しています。"
  ),
  reading(
    "q-read-bird-navigation-3",
    "p-bird-navigation",
    "The word \"innate\" in the passage is closest in meaning to",
    ["learned through practice", "present from birth", "extremely rare", "impossible to study"],
    1,
    "\"Innate rather than learned\" な能力とは、生まれつき備わっている能力のことです。"
  ),
  reading(
    "q-read-bird-navigation-4",
    "p-bird-navigation",
    "It can be inferred from the passage that young birds completing their first migration successfully suggests that",
    [
      "all navigational ability is learned from adult birds",
      "at least some navigational ability is present without prior experience",
      "young birds cannot navigate using magnetic fields",
      "migration routes never change between generations",
    ],
    1,
    "本文には若い鳥が \"often complete the journey successfully even without prior experience or adult guidance\" とあり、生まれつきの能力があることが示唆されています。"
  ),
  reading(
    "q-read-bird-navigation-5",
    "p-bird-navigation",
    "The word \"this sense\" in paragraph 2 refers to",
    ["the ability to see stars", "the ability to detect Earth's magnetic field", "the ability to smell nesting sites", "the ability to build mental maps"],
    1,
    "\"This sense\" は、その段落の前半で説明されている、地磁気を感知する磁気受容感覚を指しています。"
  ),
  reading(
    "q-read-bird-navigation-6",
    "p-bird-navigation",
    "According to the passage, all of the following are mentioned as tools migratory birds may use to navigate EXCEPT",
    ["Earth's magnetic field", "the position of the sun and stars", "visual landmarks and smell", "radio signals from other birds"],
    3,
    "本文は地磁気、太陽や星の位置、目印や匂いに触れていますが、他の鳥からの電波信号については述べていません。"
  ),
  reading(
    "q-read-assembly-line-1",
    "p-assembly-line",
    "What is the passage mainly about?",
    [
      "The biography of Henry Ford",
      "How the moving assembly line transformed manufacturing efficiency and had lasting effects on industry",
      "The mechanical design of the Model T engine",
      "Labor union strikes in the automobile industry",
    ],
    1,
    "本文は組み立てライン(アセンブリーライン)が製造効率をどう変え、産業全体に長期的な影響を与えたかを説明しています。"
  ),
  reading(
    "q-read-assembly-line-2",
    "p-assembly-line",
    "According to the passage, how long did it take to build a car after the assembly line was introduced?",
    ["More than twelve hours", "Roughly ninety minutes", "Exactly one week", "About thirty seconds"],
    1,
    "本文には工場が \"reduced the time required to build a single car to roughly ninety minutes\" とあります。"
  ),
  reading(
    "q-read-assembly-line-3",
    "p-assembly-line",
    "The word \"monotony\" in the passage is closest in meaning to",
    ["danger", "repetitiveness", "complexity", "high pay"],
    1,
    "\"Monotony of repetitive tasks\" は、単純作業の反復性を表しています。"
  ),
  reading(
    "q-read-assembly-line-4",
    "p-assembly-line",
    "It can be inferred from the passage that Ford increased assembly line workers' wages partly because",
    [
      "government regulations required it",
      "repetitive tasks caused high worker turnover that higher wages helped reduce",
      "the Model T's price was increasing rapidly",
      "skilled craftsmanship became more valuable",
    ],
    1,
    "本文には賃金上昇の理由として \"in part to reduce the high turnover caused by the monotony of repetitive tasks\" とあります。"
  ),
  reading(
    "q-read-assembly-line-5",
    "p-assembly-line",
    "The word \"it\" in paragraph 3, in the phrase \"it also drew criticism,\" refers to",
    ["the automobile industry generally", "the assembly line", "the Model T specifically", "Henry Ford personally"],
    1,
    "この文は、組み立てラインによる効率性の向上と、それが同時に受けた批判とを対比しています。"
  ),
  reading(
    "q-read-assembly-line-6",
    "p-assembly-line",
    "According to the passage, all of the following are mentioned as effects of the assembly line EXCEPT",
    ["a reduction in the time needed to build a car", "lower prices for the Model T", "criticism for reducing skilled work to repetitive tasks", "the complete elimination of factory jobs"],
    3,
    "本文は建造時間の短縮、価格低下、単純労働化への批判に触れていますが、工場労働の完全な消滅については述べていません。"
  ),
];
