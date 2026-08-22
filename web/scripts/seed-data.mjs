// オリジナル問題データ(AI生成→本セッションでのダブルチェック→人間確認を経た初期シードセット)
// v1目標(Structure120/Reading150)に対する投入分。継続的に管理画面経由で追加していく。

import { structureCompletionBatch2 } from "./seed-data-structure-completion-2.mjs";
import { structureErrorBatch2 } from "./seed-data-structure-error-2.mjs";
import { readingPassagesBatchA, readingQuestionsBatchA } from "./seed-data-reading-batch-a.mjs";
import { readingPassagesBatchB, readingQuestionsBatchB } from "./seed-data-reading-batch-b.mjs";

export const sections = [
  { slug: "structure", nameJa: "Grammar", sortOrder: 1 },
  { slug: "reading", nameJa: "Reading", sortOrder: 2 },
  { slug: "listening", nameJa: "Listening", sortOrder: 3 },
];

export const passages = [
  {
    id: "p-horse",
    sectionSlug: "reading",
    title: "The Domestication of the Horse",
    body: `Archaeologists have long debated when and where humans first domesticated the horse. For much of the twentieth century, the prevailing view held that horse domestication began on the Eurasian steppe, in what is now Kazakhstan, roughly six thousand years ago. This theory rested largely on indirect evidence: wear patterns on horse teeth suggested the use of bits, and unusually large deposits of horse bones at certain sites hinted at organized herding rather than opportunistic hunting.

Recent genetic studies, however, have complicated this picture. By comparing DNA extracted from ancient horse remains across Europe and Asia, researchers have found that nearly all modern domestic horses descend from a single population that lived in the lower Volga-Don region around 4,200 years ago, considerably later and further west than the Kazakhstan steppe. This population appears to have spread with remarkable speed, largely replacing local wild and previously domesticated horse lineages within a few centuries. Scientists suspect that this rapid expansion was tied to two heritable traits: a calmer temperament and a stronger backbone, both of which would have made the animals easier to control and better suited to sustained riding.

The genetic evidence does not necessarily overturn every aspect of the older theory, since earlier, less successful attempts at domestication may still have occurred on the steppe. It does, however, suggest that the horses ultimately responsible for transforming transportation, warfare, and trade across Eurasia trace back to a narrower place and time than previously assumed.`,
  },
  {
    id: "p-coral",
    sectionSlug: "reading",
    title: "Coral Bleaching",
    body: `Coral reefs, though they occupy less than one percent of the ocean floor, support roughly a quarter of all known marine species. This extraordinary productivity depends on a partnership between coral polyps, tiny animals related to sea anemones, and microscopic algae called zooxanthellae that live within the polyps' tissues. The algae photosynthesize and supply the coral with nutrients, while the coral provides the algae with a protected habitat and compounds needed for photosynthesis. It is the pigments within these algae that give healthy reefs their vivid colors.

When water temperatures rise even slightly above their normal range for an extended period, this partnership breaks down. Heat-stressed coral polyps expel their algae, leaving behind a translucent tissue through which the white calcium carbonate skeleton becomes visible, a phenomenon known as bleaching. Bleached coral is not immediately dead; if temperatures return to normal quickly enough, polyps can reabsorb algae and recover. Prolonged or repeated bleaching events, however, leave coral without its primary energy source, making the reef increasingly vulnerable to disease and, eventually, death.

Because reef-building corals grow extremely slowly, often only a few centimeters per year, recovery from severe bleaching can take decades even under favorable conditions. As ocean temperatures continue to rise, scientists warn that bleaching events are becoming both more frequent and more severe, leaving many reefs with insufficient time to recover between episodes.`,
  },
  {
    id: "p-insulin",
    sectionSlug: "reading",
    title: "The Discovery of Insulin",
    body: `Before the 1920s, a diagnosis of type 1 diabetes was effectively a death sentence, particularly for children, who often survived only a few years after symptoms appeared. The disease's connection to the pancreas had been suspected since the 1880s, after researchers observed that dogs whose pancreases were surgically removed developed symptoms strikingly similar to diabetes. Yet decades of attempts to isolate the pancreatic substance responsible for regulating blood sugar had failed, largely because digestive enzymes in the pancreas broke down the substance before it could be extracted in usable form.

In 1921, a young surgeon named Frederick Banting, working with a medical student, Charles Best, in a borrowed laboratory at the University of Toronto, devised a method to sidestep this problem: by tying off the pancreatic duct in dogs, they caused the enzyme-producing tissue to degenerate while preserving the cells now known to produce insulin. From the surviving tissue, they extracted a substance that dramatically lowered blood sugar in diabetic dogs. Within a year, with the help of biochemist James Collip, who refined the extraction process enough to make it safe for humans, the team successfully treated a fourteen-year-old patient near death from diabetic complications.

The speed with which insulin moved from laboratory experiment to lifesaving treatment was virtually unprecedented in medicine at the time. Banting and the laboratory's director, John Macleod, received the Nobel Prize in Physiology or Medicine in 1923, just two years after the initial discovery, a recognition that also acknowledged, not without some controversy, the essential contributions of Best and Collip.`,
  },
  {
    id: "p-urban-heat",
    sectionSlug: "reading",
    title: "Urban Heat Islands",
    body: `Cities are, on average, measurably warmer than the rural areas that surround them, a phenomenon known as the urban heat island effect. Temperature differences between a city center and its outskirts can exceed five degrees Celsius on a calm, clear evening, though the effect is generally smaller during the day and in windy or cloudy conditions. The primary cause is not a mystery: materials common in urban construction, such as asphalt and dark rooftops, absorb far more solar radiation during the day than natural vegetation does, then slowly release that stored heat after sunset.

Several other factors compound the effect. Tall buildings can trap heat by blocking wind that would otherwise disperse it, and the dense arrangement of structures reduces the amount of exposed vegetation that would normally cool the air through evaporation. Waste heat from vehicles, air conditioning units, and industrial processes adds still more warmth directly into the urban atmosphere, particularly during periods of high energy demand.

The consequences extend beyond simple discomfort. Elevated nighttime temperatures have been linked to increased rates of heat-related illness, particularly among elderly residents without access to air conditioning, and higher energy consumption as cooling systems work harder to maintain comfortable indoor temperatures. In response, some cities have begun experimenting with mitigation strategies, including reflective or "cool" roofing materials, expanded tree canopy coverage, and green roofs planted with vegetation, all intended to reduce how much solar energy urban surfaces absorb and retain.`,
  },
  {
    id: "p-silk-road",
    sectionSlug: "reading",
    title: "The Silk Road's Economic Legacy",
    body: `The term "Silk Road" evokes images of camel caravans carrying silk from China to the Mediterranean, but the network of overland and maritime routes it describes carried far more than a single luxury good, and served a much wider economic function than simple long-distance trade. Spices, precious stones, glassware, paper-making technology, and even certain crops traveled these routes in both directions over roughly fifteen centuries, from around 130 BCE until the network's decline in the fifteenth century following the rise of direct sea trade between Europe and Asia.

Beyond the goods themselves, the Silk Road functioned as a corridor for the exchange of ideas, technologies, and even diseases. Papermaking, which originated in China, is believed to have reached the Islamic world and eventually Europe largely through contact along these trade routes, fundamentally changing how information was recorded and disseminated. Religious traditions, including Buddhism, spread from South Asia into Central Asia and China partly through the movement of merchants and monks who traveled alongside trade caravans.

Economically, the Silk Road encouraged the growth of cities along its routes that specialized in facilitating trade rather than producing goods themselves, functioning much as modern logistics hubs do today. Cities such as Samarkand and Kashgar prospered largely because of their strategic locations rather than their own manufacturing output, developing sophisticated systems of currency exchange, credit, and contract law to accommodate merchants from vastly different cultural and legal backgrounds. This need for cross-cultural commercial cooperation arguably makes the Silk Road one of the earliest large-scale examples of international economic integration.`,
  },
  {
    id: "p-impressionism",
    sectionSlug: "reading",
    title: "The Rise of Impressionist Painting",
    body: `In 1874, a group of Paris-based artists, denied entry into the officially sanctioned Salon exhibition, organized an independent show of their own work. Critics were largely unkind: one, mocking a Claude Monet painting titled "Impression, Sunrise", coined the term "Impressionist" as an insult, suggesting the works looked unfinished, as if the artists had captured only a fleeting impression rather than a fully realized scene. The label, intended to dismiss the movement, was instead adopted by the artists themselves.

What critics read as carelessness was, in fact, a deliberate departure from academic convention. Rather than composing paintings in a studio from careful preliminary sketches, the Impressionists frequently worked outdoors, painting rapidly to capture transient effects of natural light before they changed. This method favored visible, broken brushstrokes and unmixed colors placed side by side over the smooth, blended surfaces the Salon prized. Everyday subjects, such as train stations, cafes, and riverside gatherings, replaced the historical and mythological scenes long considered proper subjects for serious art.

Though initially ridiculed, Impressionism gradually won public favor over the following two decades, aided in part by dealers willing to promote the artists' work outside the traditional Salon system. By the early twentieth century, the movement was widely recognized not merely as a legitimate style but as a decisive break that opened the way for the even more radical experiments of later modern art.`,
  },
  ...readingPassagesBatchA,
  ...readingPassagesBatchB,
];

function struct(id, type, stem, choices, correctIndex, explanation, difficulty = "medium") {
  return {
    id,
    sectionSlug: "structure",
    passageId: null,
    questionType: type,
    stem,
    choices,
    correctIndex,
    explanation,
    difficulty,
  };
}

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

export const structureQuestions = [
  struct(
    "q-struct-c01",
    "structure_completion",
    "_____ the mission was originally scheduled for launch in March, technical problems delayed it until June.",
    ["Although", "Despite", "Because of", "In spite"],
    0,
    "後ろに従属節が続いているため、\"Although\" のような従属接続詞が必要です。\"Despite\" や \"In spite (of)\" は節ではなく名詞句を伴い、\"Because of\" では意味が逆になってしまいます。",
    "medium"
  ),
  struct(
    "q-struct-c02",
    "structure_completion",
    "Not until the twentieth century _____ widely available to ordinary households.",
    ["electricity became", "did electricity become", "electricity did become", "had electricity become"],
    1,
    "文頭に \"Not until...\" が来ると主語と助動詞の倒置が起こり、\"did + 主語 + 動詞の原形\" の語順になります。",
    "hard"
  ),
  struct(
    "q-struct-c03",
    "structure_completion",
    "The committee requested that the report _____ before the end of the fiscal year.",
    ["is submitted", "submitted", "be submitted", "will be submitted"],
    2,
    "\"request that\" は仮定法現在を要求する動詞で、時制に関係なく原形の \"be submitted\" を使います。",
    "medium"
  ),
  struct(
    "q-struct-c04",
    "structure_completion",
    "_____ of the two candidates has the experience necessary to lead the department.",
    ["Neither", "None", "Both", "All"],
    0,
    "\"neither\" はちょうど2つのものについて使い、\"none\" は3つ以上の場合に使います。",
    "easy"
  ),
  struct(
    "q-struct-c05",
    "structure_completion",
    "The museum's new wing, _____ construction took nearly three years, opens to the public next month.",
    ["which", "whose", "that", "who"],
    1,
    "「建設(工事)」が「新館」に属することを示すには所有格の関係代名詞が必要で、\"whose\" は人にも物にも使えます。",
    "medium"
  ),
  struct(
    "q-struct-c06",
    "structure_completion",
    "It is essential that every employee _____ the updated safety guidelines before returning to the factory floor.",
    ["reviews", "review", "reviewing", "will review"],
    1,
    "\"It is essential that\" の後には仮定法現在の原形 \"review\" が必要です。",
    "medium"
  ),
  struct(
    "q-struct-c07",
    "structure_completion",
    "_____ increasing air travel, many small regional airports have struggled to remain profitable.",
    ["Despite", "Although", "However", "Nevertheless"],
    0,
    "後ろに名詞句(\"increasing air travel\")が続いているため、接続詞や副詞ではなく \"Despite\" のような前置詞が必要です。",
    "medium"
  ),
  struct(
    "q-struct-c08",
    "structure_completion",
    "The new bridge is _____ than the one it replaced, allowing much heavier trucks to cross safely.",
    ["more strong", "stronger", "as strong", "the strongest"],
    1,
    "\"strong\" のような1音節の形容詞は \"more\" ではなく \"-er\" を付けて比較級を作ります。",
    "easy"
  ),
  struct(
    "q-struct-c09",
    "structure_completion",
    "Rarely _____ such a well-preserved fossil found outside a controlled excavation site.",
    ["is", "has been", "it is", "being"],
    1,
    "否定的な意味を持つ副詞 \"Rarely\" が文頭に来ると倒置が起こり、\"has + 主語 + been\" の語順になります。",
    "hard"
  ),
  struct(
    "q-struct-c10",
    "structure_completion",
    "The scientist explained _____ the experiment had failed.",
    ["why did", "why", "that why", "the reason why did"],
    1,
    "間接疑問文(埋め込み疑問文)では疑問詞の倒置は起こらず、通常の語順を使います。したがって \"explained why the experiment had failed\" となります。",
    "medium"
  ),
  struct(
    "q-struct-c11",
    "structure_completion",
    "_____ to reduce costs, the airline eliminated several unprofitable routes.",
    ["In an effort", "With an effort", "By effort", "For efforts"],
    0,
    "\"in an effort to + 動詞\" は \"in order to\"(〜するために)と同じ意味を表す定型表現です。",
    "medium"
  ),
  struct(
    "q-struct-c12",
    "structure_completion",
    "The data collected during the survey _____ far more comprehensive than researchers had expected.",
    ["were", "was", "are", "have been"],
    0,
    "\"data\" は \"datum\" の複数形であり、日常会話では単数扱いされることも多いですが、フォーマルな英語(試験で問われる英語)では複数動詞 \"were\" を取ります。",
    "hard"
  ),
  struct(
    "q-struct-c13",
    "structure_completion",
    "If the bridge _____ properly maintained, the collapse could have been prevented.",
    ["was", "were", "had been", "has been"],
    2,
    "これは過去の事実に反する仮定を表す仮定法過去完了(第3条件文)で、\"could have been prevented\" に対応するif節には \"had been\" が必要です。",
    "hard"
  ),
  struct(
    "q-struct-c14",
    "structure_completion",
    "Only after the results were independently verified _____ the findings for publication.",
    ["the team accepted", "did the team accept", "the team did accept", "had the team accepted"],
    1,
    "文頭に \"Only after...\" が来ると主節で主語と助動詞の倒置が起こり、\"did + 主語 + 動詞の原形\" の語順になります。",
    "hard"
  ),
  struct(
    "q-struct-c15",
    "structure_completion",
    "The new regulation applies to _____ manufacturers importing goods into the country.",
    ["all", "every", "each", "all of"],
    0,
    "\"all\" は複数名詞 \"manufacturers\" を正しく修飾できます。\"every\" と \"each\" は単数名詞を必要とし、\"all of\" を使うなら名詞の前に \"the\" が必要です。",
    "easy"
  ),
  struct(
    "q-struct-c16",
    "structure_completion",
    "The lecture covered not only the causes of the recession _____ also its long-term effects on employment.",
    ["but", "and", "or", "so"],
    0,
    "\"not only... but also...\"(〜だけでなく…も)は決まった相関接続詞のペアです。",
    "easy"
  ),
  struct(
    "q-struct-c17",
    "structure_completion",
    "The professor recommended _____ the assignment before attending the seminar.",
    ["to complete", "completing", "complete", "completion"],
    1,
    "\"recommend\" の後には不定詞ではなく動名詞(\"completing\")が続きます。",
    "medium"
  ),
  struct(
    "q-struct-c18",
    "structure_completion",
    "_____ the report is finished, the team will begin drafting the next proposal.",
    ["Until", "Once", "Unless", "Since"],
    1,
    "\"once\" は「〜するとすぐに」という意味で、報告書を終えてから次の作業に取りかかるという時間的な流れに合います。",
    "medium"
  ),
  struct(
    "q-struct-c19",
    "structure_completion",
    "The findings of the two studies, though conducted independently, _____ remarkably similar.",
    ["is", "was", "are", "has been"],
    2,
    "主語 \"findings\" は複数形なので、現在形の動詞は \"are\" でなければなりません。",
    "medium"
  ),
  struct(
    "q-struct-c20",
    "structure_completion",
    "The city council debated whether the new stadium _____ funded through public bonds or private investment.",
    ["should be", "should", "should being", "is should be"],
    0,
    "\"whether\" の後には受動態の助動詞構文 \"should be funded\" が必要です。",
    "medium"
  ),
  struct(
    "q-struct-c21",
    "structure_completion",
    "The committee has yet _____ a final decision on the merger.",
    ["to make", "making", "make", "made"],
    0,
    "\"has yet to + 動詞の原形\" は「まだ〜していない」という意味を表す定型表現です。",
    "medium"
  ),
  struct(
    "q-struct-c22",
    "structure_completion",
    "The more data scientists collected, _____ their models became.",
    ["more accurate", "the more accurate", "accurate", "most accurate"],
    1,
    "\"the more..., the more...\"(〜すればするほど…)という相関比較構文では、両方の比較級の前に \"the\" が必要です。",
    "hard"
  ),
  struct(
    "q-struct-c23",
    "structure_completion",
    "The manuscript, along with the accompanying illustrations, _____ donated to the university library.",
    ["were", "was", "have been", "are"],
    1,
    "\"along with the accompanying illustrations\" は挿入句であり、動詞は単数主語 \"manuscript\" に一致させて \"was\" にする必要があります。",
    "hard"
  ),
  struct(
    "q-struct-c24",
    "structure_completion",
    "Few of the witnesses _____ willing to testify in court.",
    ["was", "is", "were", "has been"],
    2,
    "\"few\" は複数扱いの数量詞なので、動詞も複数形の \"were\" にする必要があります。",
    "easy"
  ),
  struct(
    "q-struct-e01",
    "structure_error_id",
    "The results of the study, which was published last year, suggest that the new treatment is more effective than previously believed.",
    ["which was published last year", "suggest that the new treatment", "is more effective than", "previously believed"],
    0,
    "関係代名詞 \"which\" は複数形の \"results\" を指しているため、動詞は \"was\" ではなく \"were\" にする必要があります。",
    "medium"
  ),
  struct(
    "q-struct-e02",
    "structure_error_id",
    "Despite their initial success, the company's profits have steady declined over the past three years.",
    ["their initial success", "the company's profits", "have steady declined", "over the past three years"],
    2,
    "動詞 \"declined\" を修飾するには形容詞 \"steady\" ではなく副詞 \"steadily\" を使う必要があります。",
    "medium"
  ),
  struct(
    "q-struct-e03",
    "structure_error_id",
    "Each of the applicants were required to submit a portfolio along with a letter of recommendation.",
    ["were required to", "submit a portfolio", "along with", "a letter of recommendation"],
    0,
    "\"each of the applicants\" は文法上単数扱いなので、動詞は \"were required\" ではなく \"was required\" にする必要があります。",
    "medium"
  ),
  struct(
    "q-struct-e04",
    "structure_error_id",
    "The number of students enrolling in online courses have risen sharply since the university expanded its remote offerings.",
    ["enrolling in online courses", "have risen sharply", "since the university", "expanded its remote offerings"],
    1,
    "\"the number of\" は単数動詞(\"has risen\")を取ります。複数動詞を取る \"a number of\" とは異なるので注意が必要です。",
    "hard"
  ),
  struct(
    "q-struct-e05",
    "structure_error_id",
    "Scientists have long debated whether Pluto should be classify as a planet or a dwarf planet.",
    ["whether Pluto should", "be classify as", "a planet or", "a dwarf planet"],
    1,
    "助動詞 \"should\" の後には受動態の原形 \"be classified\" が必要で、\"be classify\" という形は誤りです。",
    "easy"
  ),
  struct(
    "q-struct-e06",
    "structure_error_id",
    "The recipe calls for two cups of flour, a teaspoon of salt, and beating the eggs until frothy.",
    ["two cups of flour", "a teaspoon of salt", "beating the eggs", "until frothy"],
    2,
    "リストの列挙は名詞句として並列(\"two cups of flour\"、\"a teaspoon of salt\"、\"two beaten eggs\")にそろえる必要がありますが、\"beating the eggs\" だけ動名詞句になっており、パラレリズム(並列構造)が崩れています。",
    "medium"
  ),
  struct(
    "q-struct-e07",
    "structure_error_id",
    "Although the medication reduced her symptoms, it also caused several side effect that concerned her doctor.",
    ["reduced her symptoms", "it also caused", "several side effect", "that concerned her doctor"],
    2,
    "数量詞 \"several\" の後には複数名詞が必要なので、\"several side effect\" ではなく \"several side effects\" が正しい形です。",
    "easy"
  ),
  struct(
    "q-struct-e08",
    "structure_error_id",
    "By the time the film crew arrived, the storm had already destroy much of the coastal village's fishing fleet.",
    ["the storm had already", "destroy much of", "the coastal village's", "fishing fleet"],
    1,
    "過去完了形では原形の \"destroy\" ではなく過去分詞を使った \"had already destroyed\" にする必要があります。",
    "medium"
  ),
  struct(
    "q-struct-e09",
    "structure_error_id",
    "The findings, which was presented at the conference, challenged decades of prior research on the subject.",
    ["which was presented at the conference", "challenged decades of", "prior research", "on the subject"],
    0,
    "関係代名詞 \"which\" は複数形の \"findings\" を指しているため、動詞は \"was\" ではなく \"were\" にする必要があります。",
    "medium"
  ),
  struct(
    "q-struct-e10",
    "structure_error_id",
    "The engineers worked quick to repair the damaged pipeline before the storm arrived.",
    ["worked quick to repair", "the damaged pipeline", "before the storm", "arrived"],
    0,
    "動詞 \"worked\" を修飾するには形容詞 \"quick\" ではなく副詞 \"quickly\" を使う必要があります。",
    "easy"
  ),
  struct(
    "q-struct-e11",
    "structure_error_id",
    "The committee is responsible to ensure that all safety protocols are strictly followed during construction.",
    ["is responsible to ensure", "that all safety protocols", "are strictly followed", "during construction"],
    0,
    "正しい表現は \"responsible to ensure\" ではなく \"responsible for ensuring\" です。",
    "medium"
  ),
  struct(
    "q-struct-e12",
    "structure_error_id",
    "Of the two proposals, the second one is more preferable because it costs less to implement.",
    ["Of the two proposals", "the second one is more preferable", "because it costs less", "to implement"],
    1,
    "\"preferable\" はそれ自体に比較の意味(「より望ましい」)が含まれているため、\"more\" を付けるのは冗長です。単に \"preferable\" とすべきです。",
    "hard"
  ),
  struct(
    "q-struct-e13",
    "structure_error_id",
    "By next year, the company will completed the transition to renewable energy sources.",
    ["By next year", "the company will completed", "the transition to", "renewable energy sources"],
    1,
    "\"by next year\" は未来のある時点までに完了している動作を示すため、未来完了形 \"will have completed\" が必要です。",
    "medium"
  ),
  struct(
    "q-struct-e14",
    "structure_error_id",
    "The workshop taught participants how to write clearly, organize their arguments, and to present with confidence.",
    ["how to write clearly", "organize their arguments", "and to present", "with confidence"],
    2,
    "リストは \"write\"、\"organize\"、\"present\" という並列構造を保つべきですが、\"to present\" だけ \"to\" を繰り返しており、パラレリズムが崩れています。",
    "medium"
  ),
  struct(
    "q-struct-e15",
    "structure_error_id",
    "There has been several complaints filed against the company this month.",
    ["There has been", "several complaints", "filed against", "the company this month"],
    0,
    "主語 \"complaints\" は複数形なので、there構文では \"There has been\" ではなく \"There have been\" が必要です。",
    "easy"
  ),
  struct(
    "q-struct-e16",
    "structure_error_id",
    "Fewer rainfall this year has led to a severe drought across the region.",
    ["Fewer rainfall this year", "has led", "to a severe drought", "across the region"],
    0,
    "\"rainfall\" は不可算名詞なので、可算名詞に使う \"fewer\" ではなく \"less\" で修飾する必要があります。",
    "medium"
  ),
  ...structureCompletionBatch2,
  ...structureErrorBatch2,
];

export const readingQuestions = [
  reading(
    "q-read-horse-1",
    "p-horse",
    "What is the main purpose of the passage?",
    [
      "To argue that horses were never domesticated on the Eurasian steppe",
      "To describe how genetic research has revised earlier ideas about where and when horses were domesticated",
      "To explain the biological differences between wild and domestic horses",
      "To criticize archaeologists for relying on indirect evidence",
    ],
    1,
    "本文は、遺伝子研究によって馬の家畜化に関する定説が、以前のカザフスタン草原説からヴォルガ・ドン地域説へと移り変わった経緯をたどっています。"
  ),
  reading(
    "q-read-horse-2",
    "p-horse",
    "According to the passage, what evidence originally supported the theory that horses were domesticated in Kazakhstan?",
    [
      "Genetic comparisons of ancient horse DNA",
      "Cave paintings depicting horseback riding",
      "Wear patterns on horse teeth and large deposits of horse bones",
      "Written records from early steppe civilizations",
    ],
    2,
    "本文には、以前の説が \"rested largely on indirect evidence: wear patterns on horse teeth... and unusually large deposits of horse bones\"(間接的な証拠、すなわち馬の歯のすり減り方や大量の馬の骨の堆積に大きく依拠していた)とあります。"
  ),
  reading(
    "q-read-horse-3",
    "p-horse",
    "The word \"prevailing\" in the passage is closest in meaning to",
    ["outdated", "dominant", "controversial", "incorrect"],
    1,
    "\"prevailing\" は当時最も広く受け入れられていた見解、つまり「支配的な」見解を表します。"
  ),
  reading(
    "q-read-horse-4",
    "p-horse",
    "It can be inferred from the passage that the horses from the lower Volga-Don region spread quickly because",
    [
      "they were transported by boat across major rivers",
      "they had traits that made them easier to control and ride",
      "local horse populations had already died out",
      "they were traded exclusively among steppe nomads",
    ],
    1,
    "本文では、急速な広がりは \"a calmer temperament and a stronger backbone\"(穏やかな気性とより強靭な背骨)という特徴と結び付けられており、これらの特徴によって馬は制御しやすく、乗馬に適していました。"
  ),
  reading(
    "q-read-horse-5",
    "p-horse",
    "The word \"This population\" in paragraph 2 refers to",
    [
      "modern domestic horses",
      "researchers studying ancient DNA",
      "the horses from the lower Volga-Don region",
      "horses on the Kazakhstan steppe",
    ],
    2,
    "この語句は、直前にある \"a single population that lived in the lower Volga-Don region\"(ヴォルガ・ドン下流域に生息していた単一の集団)という記述を指しています。"
  ),
  reading(
    "q-read-horse-6",
    "p-horse",
    "According to the passage, all of the following are mentioned as being affected by horse domestication EXCEPT",
    ["transportation", "warfare", "trade", "agriculture"],
    3,
    "最終段落では輸送・戦争・交易が挙げられていますが、農業については本文中で触れられていません。"
  ),
  reading(
    "q-read-coral-1",
    "p-coral",
    "What is the passage mainly about?",
    [
      "The variety of species that live in coral reefs",
      "How rising water temperatures disrupt the relationship between coral and algae",
      "Methods scientists use to measure ocean temperature",
      "The life cycle of zooxanthellae algae",
    ],
    1,
    "本文は、熱ストレスによってサンゴと藻類の共生関係が崩れ、白化現象が起こる仕組みを中心に述べています。"
  ),
  reading(
    "q-read-coral-2",
    "p-coral",
    "According to the passage, what do zooxanthellae algae provide to coral polyps?",
    [
      "Protection from predators",
      "A hard calcium carbonate skeleton",
      "Nutrients through photosynthesis",
      "Compounds needed for reproduction",
    ],
    2,
    "本文には藻類が \"photosynthesize and supply the coral with nutrients\"(光合成を行いサンゴに栄養を供給する)とあります。"
  ),
  reading(
    "q-read-coral-3",
    "p-coral",
    "The word \"translucent\" in the passage is closest in meaning to",
    ["brightly colored", "partly transparent", "extremely fragile", "thickly layered"],
    1,
    "\"translucent\" は白い骨格が透けて見える組織を表す語で、つまり「半透明の」という意味です。"
  ),
  reading(
    "q-read-coral-4",
    "p-coral",
    "It can be inferred from the passage that a bleached coral reef would appear",
    ["darker than a healthy reef", "the same color as a healthy reef", "paler or whiter than a healthy reef", "covered in algae"],
    2,
    "白化は色を与えている藻類が失われた後に白い骨格が露出する現象なので、白化したサンゴ礁はより白っぽく、色が薄く見えるはずです。"
  ),
  reading(
    "q-read-coral-5",
    "p-coral",
    "The word \"this partnership\" in paragraph 2 refers to",
    [
      "the relationship between coral polyps and zooxanthellae algae",
      "the relationship between scientists and reef ecosystems",
      "the connection between ocean currents and temperature",
      "the balance between predators and prey on the reef",
    ],
    0,
    "第1段落でサンゴと藻類の共生関係が説明されており、第2段落の \"this partnership\" はそれを指しています。"
  ),
  reading(
    "q-read-coral-6",
    "p-coral",
    "According to the passage, all of the following are true about coral recovery EXCEPT",
    [
      "bleached coral can sometimes recover if temperatures return to normal quickly",
      "coral grows only a few centimeters per year",
      "recovery from severe bleaching can take decades",
      "coral recovers fully within a single year regardless of damage",
    ],
    3,
    "本文には深刻な白化からの回復には \"can take decades\"(数十年かかることもある)とあり、1年以内に完全回復するという記述とは直接矛盾します。"
  ),
  reading(
    "q-read-imp-1",
    "p-impressionism",
    "What is the main topic of the passage?",
    [
      "The biography of Claude Monet",
      "The origin and development of Impressionist painting",
      "The rules of the official Salon exhibition",
      "A comparison between Impressionism and modern art",
    ],
    1,
    "本文は、印象派が侮蔑的な呼び名として始まり、やがて確立された芸術運動へと発展していった経緯をたどっています。"
  ),
  reading(
    "q-read-imp-2",
    "p-impressionism",
    "According to the passage, how did the term \"Impressionist\" originate?",
    [
      "The artists chose it themselves before their first exhibition",
      "A critic used it to mock a painting by Claude Monet",
      "It was the name of the gallery where the artists exhibited",
      "It referred to a technique taught at the official Salon",
    ],
    1,
    "本文には、ある批評家が \"mocking a Claude Monet painting... coined the term 'Impressionist' as an insult\"(クロード・モネの絵画をあざけって「印象派」という語を侮辱として作り出した)とあります。"
  ),
  reading(
    "q-read-imp-3",
    "p-impressionism",
    "The word \"transient\" in the passage is closest in meaning to",
    ["permanent", "brief", "colorful", "natural"],
    1,
    "\"transient effects of natural light\" は、すぐに変化する光の効果、つまり「一時的な」効果を指しています。"
  ),
  reading(
    "q-read-imp-4",
    "p-impressionism",
    "It can be inferred from the passage that the official Salon exhibition preferred paintings that were",
    [
      "painted quickly outdoors",
      "based on everyday, modern subjects",
      "carefully composed with smooth, blended surfaces",
      "rejected by professional art dealers",
    ],
    2,
    "本文では、印象派の目に見える筆致と、\"the smooth, blended surfaces the Salon prized\"(サロンが高く評価していた滑らかで混ぜ合わされた画面)とが対比されています。"
  ),
  reading(
    "q-read-imp-5",
    "p-impressionism",
    "The word \"their\" in paragraph 3 refers to",
    ["the critics'", "the dealers'", "the artists'", "the Salon's"],
    2,
    "この文は画商たちが \"the artists' work\"(画家たちの作品)を売り込んでいたことを述べているので、\"their\" は画家たちを指します。"
  ),
  reading(
    "q-read-imp-6",
    "p-impressionism",
    "According to the passage, all of the following are mentioned as subjects favored by Impressionist painters EXCEPT",
    ["train stations", "cafes", "riverside gatherings", "mythological scenes"],
    3,
    "本文では駅・カフェ・川辺の集いが好んで描かれた題材として挙げられている一方、神話の場面は印象派が離れていった題材として述べられています。"
  ),
  reading(
    "q-read-insulin-1",
    "p-insulin",
    "What is the passage mainly about?",
    [
      "The symptoms of type 1 diabetes in children",
      "How insulin was discovered and rapidly developed into a treatment",
      "The history of the Nobel Prize in Physiology or Medicine",
      "Surgical techniques used on laboratory animals in the 1920s",
    ],
    1,
    "本文は、膵臓に関する初期の研究からインスリンが発見され、それが急速に命を救う治療法へと発展していった経緯をたどっています。"
  ),
  reading(
    "q-read-insulin-2",
    "p-insulin",
    "According to the passage, why had earlier attempts to isolate the pancreatic substance failed?",
    [
      "Researchers could not identify which organ was involved",
      "Digestive enzymes in the pancreas broke down the substance before it could be extracted",
      "No diabetic patients were willing to participate in trials",
      "The equipment needed for extraction had not yet been invented",
    ],
    1,
    "本文には、以前の試みが失敗したのは \"largely because digestive enzymes in the pancreas broke down the substance before it could be extracted in usable form\"(膵臓内の消化酵素が、その物質を使える形で抽出する前に分解してしまっていたため)とあります。"
  ),
  reading(
    "q-read-insulin-3",
    "p-insulin",
    "The word \"degenerate\" in the passage is closest in meaning to",
    ["multiply", "break down", "become active", "relocate"],
    1,
    "\"degenerate\" は膵管を結紮した後に組織が劣化していく様子、つまり「分解する」ことを表しています。"
  ),
  reading(
    "q-read-insulin-4",
    "p-insulin",
    "It can be inferred from the passage that tying off the pancreatic duct was significant because it",
    [
      "increased the number of insulin-producing cells",
      "allowed the enzyme-producing tissue to be destroyed while preserving insulin-producing cells",
      "eliminated the need for laboratory animals",
      "cured the dogs' diabetes permanently",
    ],
    1,
    "本文では、この方法によって酵素を産生する組織を分解させる一方で、\"while preserving the cells now known to produce insulin\"(現在インスリンを産生することが分かっている細胞は保存された)と説明されています。"
  ),
  reading(
    "q-read-insulin-5",
    "p-insulin",
    "The word \"it\" in paragraph 2, in the phrase \"to make it safe for humans,\" refers to",
    ["the pancreatic duct", "the extraction process", "the substance/extract", "the laboratory"],
    2,
    "コリップは抽出された物質を人間が安全に使えるように、抽出プロセスを改良しました。"
  ),
  reading(
    "q-read-insulin-6",
    "p-insulin",
    "According to the passage, all of the following people are mentioned as contributing to the discovery of insulin EXCEPT",
    ["Frederick Banting", "Charles Best", "James Collip", "Alexander Fleming"],
    3,
    "本文にはバンティング、ベスト、コリップ(およびマクラウド)の名前が挙げられていますが、アレクサンダー・フレミングについては触れられていません。"
  ),
  reading(
    "q-read-heat-1",
    "p-urban-heat",
    "What is the main purpose of the passage?",
    [
      "To explain the causes and effects of the urban heat island effect and how cities are addressing it",
      "To compare temperatures in different cities around the world",
      "To argue that urban development should be halted",
      "To describe how air conditioning units work",
    ],
    0,
    "本文は、ヒートアイランド現象の原因、その影響、そして都市が試みている対策について説明しています。"
  ),
  reading(
    "q-read-heat-2",
    "p-urban-heat",
    "According to the passage, what is the primary cause of the urban heat island effect?",
    [
      "Waste heat from vehicles alone",
      "Materials like asphalt and dark rooftops absorbing and releasing solar radiation",
      "The height of buildings blocking sunlight",
      "A lack of rainfall in cities",
    ],
    1,
    "本文には、主な原因はアスファルトや濃い色の屋根材などが \"absorb far more solar radiation... then slowly release that stored heat after sunset\"(日中に太陽光をはるかに多く吸収し、日没後にその蓄えた熱をゆっくり放出する)ことだとあります。"
  ),
  reading(
    "q-read-heat-3",
    "p-urban-heat",
    "The word \"compound\" in the passage is closest in meaning to",
    ["reduce", "explain", "intensify", "measure"],
    2,
    "\"compound the effect\" は他の要因がその効果をさらに強める、つまり「増強する」という意味です。"
  ),
  reading(
    "q-read-heat-4",
    "p-urban-heat",
    "It can be inferred from the passage that green roofs help mitigate the urban heat island effect because they",
    [
      "generate electricity for the building",
      "reduce the amount of solar energy absorbed by rooftop surfaces",
      "eliminate the need for tall buildings",
      "increase waste heat from air conditioning",
    ],
    1,
    "屋上緑化は、\"reduce how much solar energy urban surfaces absorb and retain\"(都市の表面が吸収・保持する太陽エネルギーの量を減らす)ことを目的とした対策の一つとして挙げられています。"
  ),
  reading(
    "q-read-heat-5",
    "p-urban-heat",
    "The word \"it\" in paragraph 1, in the phrase \"release that stored heat,\" refers to heat stored in",
    ["rural vegetation", "the atmosphere generally", "urban construction materials such as asphalt and rooftops", "air conditioning units"],
    2,
    "ここで言う熱とは、日中に都市の建築資材が吸収した太陽放射のことです。"
  ),
  reading(
    "q-read-heat-6",
    "p-urban-heat",
    "According to the passage, all of the following are mentioned as mitigation strategies EXCEPT",
    ["reflective roofing materials", "expanded tree canopy coverage", "green roofs", "banning private vehicles"],
    3,
    "本文では反射性のある屋根材、樹冠(緑地)の拡大、屋上緑化が対策として挙げられていますが、車両の禁止については触れられていません。"
  ),
  reading(
    "q-read-silkroad-1",
    "p-silk-road",
    "What is the main idea of the passage?",
    [
      "The Silk Road was primarily a route for trading silk between China and Europe",
      "The Silk Road facilitated a broad exchange of goods, ideas, and technologies with lasting economic significance",
      "The Silk Road declined because of religious conflict",
      "Papermaking technology was invented along the Silk Road",
    ],
    1,
    "本文は、シルクロードが絹以外にもはるかに多くのものを運び、経済的・文化的に長く続く遺産を残したことを強調しています。"
  ),
  reading(
    "q-read-silkroad-2",
    "p-silk-road",
    "According to the passage, what caused the decline of the Silk Road network?",
    ["The invention of paper", "The rise of direct sea trade between Europe and Asia", "A decline in demand for silk", "The spread of Buddhism"],
    1,
    "本文には、このネットワークは \"following the rise of direct sea trade between Europe and Asia\"(ヨーロッパとアジア間の直接海上貿易の台頭を受けて)衰退したとあります。"
  ),
  reading(
    "q-read-silkroad-3",
    "p-silk-road",
    "The word \"disseminated\" in the passage is closest in meaning to",
    ["destroyed", "spread", "translated", "hidden"],
    1,
    "\"disseminated\" は、製紙技術が新しい地域に伝わった後に情報が記録され広まっていった様子を表しています。"
  ),
  reading(
    "q-read-silkroad-4",
    "p-silk-road",
    "It can be inferred from the passage that cities like Samarkand and Kashgar prospered mainly because they",
    [
      "produced large quantities of silk",
      "were located strategically along trade routes",
      "had large populations of merchants who manufactured goods",
      "banned foreign traders from entering",
    ],
    1,
    "本文には、これらの都市が繁栄したのは \"largely because of their strategic locations rather than their own manufacturing output\"(自らの生産力よりも主に戦略的な立地のおかげ)だとあります。"
  ),
  reading(
    "q-read-silkroad-5",
    "p-silk-road",
    "The word \"its\" in paragraph 1, in the phrase \"the network's decline,\" refers to",
    ["China's", "the Mediterranean's", "the Silk Road's", "Europe's"],
    2,
    "この語句は、同じ文の前半で述べられているシルクロードのネットワークの衰退を指しています。"
  ),
  reading(
    "q-read-silkroad-6",
    "p-silk-road",
    "According to the passage, all of the following are mentioned as having traveled along the Silk Road EXCEPT",
    ["spices", "papermaking technology", "Buddhism", "firearms"],
    3,
    "本文では香辛料、製紙技術、仏教の伝播について触れられていますが、火器については言及されていません。"
  ),
  ...readingQuestionsBatchA,
  ...readingQuestionsBatchB,
];
