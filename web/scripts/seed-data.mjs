// オリジナル問題データ(AI生成→本セッションでのダブルチェック→人間確認を経た初期シードセット)
// v1目標(Structure120/Reading150)に対する投入分。継続的に管理画面経由で追加していく。

import { structureCompletionBatch2 } from "./seed-data-structure-completion-2.mjs";
import { structureErrorBatch2 } from "./seed-data-structure-error-2.mjs";
import { readingPassagesBatchA, readingQuestionsBatchA } from "./seed-data-reading-batch-a.mjs";
import { readingPassagesBatchB, readingQuestionsBatchB } from "./seed-data-reading-batch-b.mjs";

export const sections = [
  { slug: "structure", nameJa: "Structure and Written Expression", sortOrder: 1 },
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
    "A dependent clause follows, so a subordinating conjunction like \"Although\" is required. \"Despite\" and \"In spite (of)\" take noun phrases, not clauses, and \"Because of\" would reverse the intended meaning.",
    "medium"
  ),
  struct(
    "q-struct-c02",
    "structure_completion",
    "Not until the twentieth century _____ widely available to ordinary households.",
    ["electricity became", "did electricity become", "electricity did become", "had electricity become"],
    1,
    "\"Not until...\" at the start of a sentence triggers subject-auxiliary inversion: did + subject + base verb.",
    "hard"
  ),
  struct(
    "q-struct-c03",
    "structure_completion",
    "The committee requested that the report _____ before the end of the fiscal year.",
    ["is submitted", "submitted", "be submitted", "will be submitted"],
    2,
    "\"Request that\" triggers the subjunctive mood: the base form \"be submitted\" is used regardless of tense.",
    "medium"
  ),
  struct(
    "q-struct-c04",
    "structure_completion",
    "_____ of the two candidates has the experience necessary to lead the department.",
    ["Neither", "None", "Both", "All"],
    0,
    "\"Neither\" is used for exactly two items; \"none\" is reserved for three or more.",
    "easy"
  ),
  struct(
    "q-struct-c05",
    "structure_completion",
    "The museum's new wing, _____ construction took nearly three years, opens to the public next month.",
    ["which", "whose", "that", "who"],
    1,
    "A possessive relative pronoun is needed to show that the construction belongs to the wing; \"whose\" fills that role for both people and things.",
    "medium"
  ),
  struct(
    "q-struct-c06",
    "structure_completion",
    "It is essential that every employee _____ the updated safety guidelines before returning to the factory floor.",
    ["reviews", "review", "reviewing", "will review"],
    1,
    "After \"It is essential that,\" the subjunctive base form \"review\" is required.",
    "medium"
  ),
  struct(
    "q-struct-c07",
    "structure_completion",
    "_____ increasing air travel, many small regional airports have struggled to remain profitable.",
    ["Despite", "Although", "However", "Nevertheless"],
    0,
    "A noun phrase (\"increasing air travel\") follows, so a preposition like \"Despite\" is needed rather than a conjunction or adverb.",
    "medium"
  ),
  struct(
    "q-struct-c08",
    "structure_completion",
    "The new bridge is _____ than the one it replaced, allowing much heavier trucks to cross safely.",
    ["more strong", "stronger", "as strong", "the strongest"],
    1,
    "A one-syllable adjective like \"strong\" forms its comparative by adding \"-er,\" not with \"more.\"",
    "easy"
  ),
  struct(
    "q-struct-c09",
    "structure_completion",
    "Rarely _____ such a well-preserved fossil found outside a controlled excavation site.",
    ["is", "has been", "it is", "being"],
    1,
    "The negative adverb \"Rarely\" at the start of the sentence requires inversion: has + subject + been.",
    "hard"
  ),
  struct(
    "q-struct-c10",
    "structure_completion",
    "The scientist explained _____ the experiment had failed.",
    ["why did", "why", "that why", "the reason why did"],
    1,
    "In an embedded (indirect) question, normal word order is used, not question-word inversion: \"explained why the experiment had failed.\"",
    "medium"
  ),
  struct(
    "q-struct-c11",
    "structure_completion",
    "_____ to reduce costs, the airline eliminated several unprofitable routes.",
    ["In an effort", "With an effort", "By effort", "For efforts"],
    0,
    "\"In an effort to + verb\" is the standard fixed expression meaning \"in order to.\"",
    "medium"
  ),
  struct(
    "q-struct-c12",
    "structure_completion",
    "The data collected during the survey _____ far more comprehensive than researchers had expected.",
    ["were", "was", "are", "have been"],
    0,
    "\"Data\" is the plural form of \"datum\" and in formal, tested English takes a plural verb (\"were\"), even though it is often used informally as a mass noun.",
    "hard"
  ),
  struct(
    "q-struct-c13",
    "structure_completion",
    "If the bridge _____ properly maintained, the collapse could have been prevented.",
    ["was", "were", "had been", "has been"],
    2,
    "This is a third conditional describing an unreal past situation (\"could have been prevented\"), which requires \"had been\" in the if-clause.",
    "hard"
  ),
  struct(
    "q-struct-c14",
    "structure_completion",
    "Only after the results were independently verified _____ the findings for publication.",
    ["the team accepted", "did the team accept", "the team did accept", "had the team accepted"],
    1,
    "\"Only after...\" at the start of a sentence triggers subject-auxiliary inversion in the main clause: did + subject + base verb.",
    "hard"
  ),
  struct(
    "q-struct-c15",
    "structure_completion",
    "The new regulation applies to _____ manufacturers importing goods into the country.",
    ["all", "every", "each", "all of"],
    0,
    "\"All\" correctly modifies the plural noun \"manufacturers\"; \"every\" and \"each\" require a singular noun, and \"all of\" would need \"the\" before the noun.",
    "easy"
  ),
  struct(
    "q-struct-c16",
    "structure_completion",
    "The lecture covered not only the causes of the recession _____ also its long-term effects on employment.",
    ["but", "and", "or", "so"],
    0,
    "\"Not only... but also...\" is the fixed correlative conjunction pair.",
    "easy"
  ),
  struct(
    "q-struct-c17",
    "structure_completion",
    "The professor recommended _____ the assignment before attending the seminar.",
    ["to complete", "completing", "complete", "completion"],
    1,
    "\"Recommend\" is followed by a gerund (\"completing\"), not an infinitive.",
    "medium"
  ),
  struct(
    "q-struct-c18",
    "structure_completion",
    "_____ the report is finished, the team will begin drafting the next proposal.",
    ["Until", "Once", "Unless", "Since"],
    1,
    "\"Once\" correctly conveys \"as soon as,\" matching the logical sequence of finishing the report and then starting the next task.",
    "medium"
  ),
  struct(
    "q-struct-c19",
    "structure_completion",
    "The findings of the two studies, though conducted independently, _____ remarkably similar.",
    ["is", "was", "are", "has been"],
    2,
    "The subject \"findings\" is plural, so the present-tense verb must be \"are.\"",
    "medium"
  ),
  struct(
    "q-struct-c20",
    "structure_completion",
    "The city council debated whether the new stadium _____ funded through public bonds or private investment.",
    ["should be", "should", "should being", "is should be"],
    0,
    "The passive modal construction \"should be funded\" is required after \"whether.\"",
    "medium"
  ),
  struct(
    "q-struct-c21",
    "structure_completion",
    "The committee has yet _____ a final decision on the merger.",
    ["to make", "making", "make", "made"],
    0,
    "\"Has yet to + base verb\" is a fixed expression meaning \"has not yet.\"",
    "medium"
  ),
  struct(
    "q-struct-c22",
    "structure_completion",
    "The more data scientists collected, _____ their models became.",
    ["more accurate", "the more accurate", "accurate", "most accurate"],
    1,
    "The correlative comparative structure \"The more..., the more...\" requires \"the\" before both comparatives.",
    "hard"
  ),
  struct(
    "q-struct-c23",
    "structure_completion",
    "The manuscript, along with the accompanying illustrations, _____ donated to the university library.",
    ["were", "was", "have been", "are"],
    1,
    "The phrase \"along with the accompanying illustrations\" is a parenthetical, so the verb agrees with the singular subject \"manuscript\": \"was.\"",
    "hard"
  ),
  struct(
    "q-struct-c24",
    "structure_completion",
    "Few of the witnesses _____ willing to testify in court.",
    ["was", "is", "were", "has been"],
    2,
    "\"Few\" is a plural quantifier, so the verb must be plural: \"were.\"",
    "easy"
  ),
  struct(
    "q-struct-e01",
    "structure_error_id",
    "The results of the study, which was published last year, suggest that the new treatment is more effective than previously believed.",
    ["which was published last year", "suggest that the new treatment", "is more effective than", "previously believed"],
    0,
    "The relative pronoun \"which\" refers to \"results\" (plural), so the verb should be \"were,\" not \"was.\"",
    "medium"
  ),
  struct(
    "q-struct-e02",
    "structure_error_id",
    "Despite their initial success, the company's profits have steady declined over the past three years.",
    ["their initial success", "the company's profits", "have steady declined", "over the past three years"],
    2,
    "The verb \"declined\" must be modified by an adverb, \"steadily,\" not the adjective \"steady.\"",
    "medium"
  ),
  struct(
    "q-struct-e03",
    "structure_error_id",
    "Each of the applicants were required to submit a portfolio along with a letter of recommendation.",
    ["were required to", "submit a portfolio", "along with", "a letter of recommendation"],
    0,
    "\"Each of the applicants\" is grammatically singular, so the verb should be \"was required,\" not \"were required.\"",
    "medium"
  ),
  struct(
    "q-struct-e04",
    "structure_error_id",
    "The number of students enrolling in online courses have risen sharply since the university expanded its remote offerings.",
    ["enrolling in online courses", "have risen sharply", "since the university", "expanded its remote offerings"],
    1,
    "\"The number of\" takes a singular verb (\"has risen\"), unlike \"A number of,\" which takes a plural verb.",
    "hard"
  ),
  struct(
    "q-struct-e05",
    "structure_error_id",
    "Scientists have long debated whether Pluto should be classify as a planet or a dwarf planet.",
    ["whether Pluto should", "be classify as", "a planet or", "a dwarf planet"],
    1,
    "After the modal \"should,\" the verb must appear in its base passive form: \"be classified,\" not \"be classify.\"",
    "easy"
  ),
  struct(
    "q-struct-e06",
    "structure_error_id",
    "The recipe calls for two cups of flour, a teaspoon of salt, and beating the eggs until frothy.",
    ["two cups of flour", "a teaspoon of salt", "beating the eggs", "until frothy"],
    2,
    "The list should maintain parallel noun-phrase structure (\"two cups of flour,\" \"a teaspoon of salt,\" \"two beaten eggs\"), but \"beating the eggs\" breaks the pattern by shifting to a gerund phrase.",
    "medium"
  ),
  struct(
    "q-struct-e07",
    "structure_error_id",
    "Although the medication reduced her symptoms, it also caused several side effect that concerned her doctor.",
    ["reduced her symptoms", "it also caused", "several side effect", "that concerned her doctor"],
    2,
    "The quantifier \"several\" requires a plural noun, so it should be \"several side effects,\" not \"several side effect.\"",
    "easy"
  ),
  struct(
    "q-struct-e08",
    "structure_error_id",
    "By the time the film crew arrived, the storm had already destroy much of the coastal village's fishing fleet.",
    ["the storm had already", "destroy much of", "the coastal village's", "fishing fleet"],
    1,
    "The past perfect tense requires \"had already destroyed,\" using the past participle, not the base form \"destroy.\"",
    "medium"
  ),
  struct(
    "q-struct-e09",
    "structure_error_id",
    "The findings, which was presented at the conference, challenged decades of prior research on the subject.",
    ["which was presented at the conference", "challenged decades of", "prior research", "on the subject"],
    0,
    "The relative pronoun \"which\" refers to \"findings\" (plural), so the verb should be \"were,\" not \"was.\"",
    "medium"
  ),
  struct(
    "q-struct-e10",
    "structure_error_id",
    "The engineers worked quick to repair the damaged pipeline before the storm arrived.",
    ["worked quick to repair", "the damaged pipeline", "before the storm", "arrived"],
    0,
    "The verb \"worked\" must be modified by the adverb \"quickly,\" not the adjective \"quick.\"",
    "easy"
  ),
  struct(
    "q-struct-e11",
    "structure_error_id",
    "The committee is responsible to ensure that all safety protocols are strictly followed during construction.",
    ["is responsible to ensure", "that all safety protocols", "are strictly followed", "during construction"],
    0,
    "The correct idiom is \"responsible for ensuring,\" not \"responsible to ensure.\"",
    "medium"
  ),
  struct(
    "q-struct-e12",
    "structure_error_id",
    "Of the two proposals, the second one is more preferable because it costs less to implement.",
    ["Of the two proposals", "the second one is more preferable", "because it costs less", "to implement"],
    1,
    "\"Preferable\" already carries a comparative meaning (\"more desirable\"), so adding \"more\" is redundant; it should simply be \"preferable.\"",
    "hard"
  ),
  struct(
    "q-struct-e13",
    "structure_error_id",
    "By next year, the company will completed the transition to renewable energy sources.",
    ["By next year", "the company will completed", "the transition to", "renewable energy sources"],
    1,
    "\"By next year\" signals an action completed before a future point in time, which requires the future perfect: \"will have completed.\"",
    "medium"
  ),
  struct(
    "q-struct-e14",
    "structure_error_id",
    "The workshop taught participants how to write clearly, organize their arguments, and to present with confidence.",
    ["how to write clearly", "organize their arguments", "and to present", "with confidence"],
    2,
    "The list should maintain parallel structure (\"write,\" \"organize,\" \"present\"), but \"to present\" breaks the pattern by repeating \"to.\"",
    "medium"
  ),
  struct(
    "q-struct-e15",
    "structure_error_id",
    "There has been several complaints filed against the company this month.",
    ["There has been", "several complaints", "filed against", "the company this month"],
    0,
    "The subject \"complaints\" is plural, so the existential construction requires \"There have been,\" not \"There has been.\"",
    "easy"
  ),
  struct(
    "q-struct-e16",
    "structure_error_id",
    "Fewer rainfall this year has led to a severe drought across the region.",
    ["Fewer rainfall this year", "has led", "to a severe drought", "across the region"],
    0,
    "\"Rainfall\" is an uncountable noun, so it should be modified by \"less,\" not \"fewer,\" which is reserved for countable nouns.",
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
    "The passage traces how genetic studies shifted the accepted account of horse domestication away from the earlier Kazakhstan-steppe theory toward the Volga-Don region."
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
    "The passage states the earlier theory \"rested largely on indirect evidence: wear patterns on horse teeth... and unusually large deposits of horse bones.\""
  ),
  reading(
    "q-read-horse-3",
    "p-horse",
    "The word \"prevailing\" in the passage is closest in meaning to",
    ["outdated", "dominant", "controversial", "incorrect"],
    1,
    "\"Prevailing\" describes the view that was most widely accepted at the time, i.e., the dominant view."
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
    "The passage links the rapid spread to \"a calmer temperament and a stronger backbone,\" traits that made the horses easier to control and better suited to riding."
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
    "The phrase immediately follows the description of \"a single population that lived in the lower Volga-Don region.\""
  ),
  reading(
    "q-read-horse-6",
    "p-horse",
    "According to the passage, all of the following are mentioned as being affected by horse domestication EXCEPT",
    ["transportation", "warfare", "trade", "agriculture"],
    3,
    "The final paragraph mentions transportation, warfare, and trade; agriculture is not mentioned in the passage."
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
    "The passage centers on how heat stress breaks down the coral-algae partnership, causing bleaching."
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
    "The passage states the algae \"photosynthesize and supply the coral with nutrients.\""
  ),
  reading(
    "q-read-coral-3",
    "p-coral",
    "The word \"translucent\" in the passage is closest in meaning to",
    ["brightly colored", "partly transparent", "extremely fragile", "thickly layered"],
    1,
    "\"Translucent\" describes tissue through which the white skeleton becomes visible, i.e., partly see-through."
  ),
  reading(
    "q-read-coral-4",
    "p-coral",
    "It can be inferred from the passage that a bleached coral reef would appear",
    ["darker than a healthy reef", "the same color as a healthy reef", "paler or whiter than a healthy reef", "covered in algae"],
    2,
    "Since bleaching exposes the white skeleton after algae (which provide color) are expelled, a bleached reef would look paler or white."
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
    "Paragraph 1 establishes the coral-algae partnership, which paragraph 2 refers back to as \"this partnership.\""
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
    "The passage states recovery from severe bleaching \"can take decades,\" directly contradicting full recovery within a single year."
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
    "The passage traces how Impressionism began as an insult and developed into a recognized artistic movement."
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
    "The passage states a critic, \"mocking a Claude Monet painting... coined the term 'Impressionist' as an insult.\""
  ),
  reading(
    "q-read-imp-3",
    "p-impressionism",
    "The word \"transient\" in the passage is closest in meaning to",
    ["permanent", "brief", "colorful", "natural"],
    1,
    "\"Transient effects of natural light\" refers to light effects that change quickly, i.e., brief ones."
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
    "The passage contrasts the Impressionists' visible brushstrokes with \"the smooth, blended surfaces the Salon prized.\""
  ),
  reading(
    "q-read-imp-5",
    "p-impressionism",
    "The word \"their\" in paragraph 3 refers to",
    ["the critics'", "the dealers'", "the artists'", "the Salon's"],
    2,
    "The sentence describes dealers promoting \"the artists' work,\" so \"their\" refers to the artists."
  ),
  reading(
    "q-read-imp-6",
    "p-impressionism",
    "According to the passage, all of the following are mentioned as subjects favored by Impressionist painters EXCEPT",
    ["train stations", "cafes", "riverside gatherings", "mythological scenes"],
    3,
    "The passage lists train stations, cafes, and riverside gatherings as favored subjects, while mythological scenes are described as subjects the Impressionists moved away from."
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
    "The passage traces the discovery of insulin from early research on the pancreas to its rapid development into a lifesaving treatment."
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
    "The passage states earlier attempts failed \"largely because digestive enzymes in the pancreas broke down the substance before it could be extracted in usable form.\""
  ),
  reading(
    "q-read-insulin-3",
    "p-insulin",
    "The word \"degenerate\" in the passage is closest in meaning to",
    ["multiply", "break down", "become active", "relocate"],
    1,
    "\"Degenerate\" describes tissue deteriorating after the pancreatic duct was tied off, i.e., breaking down."
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
    "The passage explains this technique caused enzyme-producing tissue to degenerate \"while preserving the cells now known to produce insulin.\""
  ),
  reading(
    "q-read-insulin-5",
    "p-insulin",
    "The word \"it\" in paragraph 2, in the phrase \"to make it safe for humans,\" refers to",
    ["the pancreatic duct", "the extraction process", "the substance/extract", "the laboratory"],
    2,
    "Collip refined the extraction process to make the extracted substance safe for human use."
  ),
  reading(
    "q-read-insulin-6",
    "p-insulin",
    "According to the passage, all of the following people are mentioned as contributing to the discovery of insulin EXCEPT",
    ["Frederick Banting", "Charles Best", "James Collip", "Alexander Fleming"],
    3,
    "Banting, Best, and Collip (along with Macleod) are named in the passage; Alexander Fleming is not mentioned."
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
    "The passage explains what causes urban heat islands, their consequences, and mitigation strategies cities are trying."
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
    "The passage states the primary cause is that materials like asphalt and dark rooftops \"absorb far more solar radiation... then slowly release that stored heat after sunset.\""
  ),
  reading(
    "q-read-heat-3",
    "p-urban-heat",
    "The word \"compound\" in the passage is closest in meaning to",
    ["reduce", "explain", "intensify", "measure"],
    2,
    "\"Compound the effect\" means other factors make the effect stronger, i.e., intensify it."
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
    "Green roofs are listed among strategies intended to \"reduce how much solar energy urban surfaces absorb and retain.\""
  ),
  reading(
    "q-read-heat-5",
    "p-urban-heat",
    "The word \"it\" in paragraph 1, in the phrase \"release that stored heat,\" refers to heat stored in",
    ["rural vegetation", "the atmosphere generally", "urban construction materials such as asphalt and rooftops", "air conditioning units"],
    2,
    "The heat referred to is the solar radiation absorbed by urban construction materials during the day."
  ),
  reading(
    "q-read-heat-6",
    "p-urban-heat",
    "According to the passage, all of the following are mentioned as mitigation strategies EXCEPT",
    ["reflective roofing materials", "expanded tree canopy coverage", "green roofs", "banning private vehicles"],
    3,
    "The passage names reflective roofing, tree canopy expansion, and green roofs as mitigation strategies; banning vehicles is not mentioned."
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
    "The passage emphasizes that the Silk Road carried far more than silk and had a lasting economic and cultural legacy."
  ),
  reading(
    "q-read-silkroad-2",
    "p-silk-road",
    "According to the passage, what caused the decline of the Silk Road network?",
    ["The invention of paper", "The rise of direct sea trade between Europe and Asia", "A decline in demand for silk", "The spread of Buddhism"],
    1,
    "The passage states the network declined \"following the rise of direct sea trade between Europe and Asia.\""
  ),
  reading(
    "q-read-silkroad-3",
    "p-silk-road",
    "The word \"disseminated\" in the passage is closest in meaning to",
    ["destroyed", "spread", "translated", "hidden"],
    1,
    "\"Disseminated\" describes how information was recorded and spread after papermaking reached new regions."
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
    "The passage states these cities prospered \"largely because of their strategic locations rather than their own manufacturing output.\""
  ),
  reading(
    "q-read-silkroad-5",
    "p-silk-road",
    "The word \"its\" in paragraph 1, in the phrase \"the network's decline,\" refers to",
    ["China's", "the Mediterranean's", "the Silk Road's", "Europe's"],
    2,
    "The phrase describes the decline of the Silk Road network described earlier in the sentence."
  ),
  reading(
    "q-read-silkroad-6",
    "p-silk-road",
    "According to the passage, all of the following are mentioned as having traveled along the Silk Road EXCEPT",
    ["spices", "papermaking technology", "Buddhism", "firearms"],
    3,
    "The passage mentions spices, papermaking technology, and the spread of Buddhism; firearms are not mentioned."
  ),
  ...readingQuestionsBatchA,
  ...readingQuestionsBatchB,
];
