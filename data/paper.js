/* Everything on the page that comes from the paper, in one place.
   Rahman, Quadri, Doppalapudi, Szafir, and Rosen. A Qualitative Analysis of
   Common Practices in Annotations: A Taxonomy and Design Space. IEEE TVCG 31(1), 2025.
   Each block names the figure or section it was transcribed from. */
window.PAPER = (() => {
  // Sect. 4.3 and 5.2.1. Counts are charts out of 1,888.
  // `here` says what the type does in Fig. 4, after the paper's caption.
  const TYPES = [
    {
      id: "enclosure",
      name: "Enclosure",
      n: 588,
      def: "A partially or fully closed boundary: an ellipse, a bracket, a rectangle.",
      here: "A rectangle identifies a group of data points in the top right.",
      usage: [
        ["identify", "a group or an individual point or area of interest"],
        ["compare", "a group or an individual point or area of interest"],
      ],
    },
    {
      id: "connector",
      name: "Connector",
      n: 393,
      def: "A line, solid, dotted, or directional as an arrow. Connectors were mostly used together with other types.",
      here: "An arrow points the sentence to the element it refers to, the correlation line.",
      usage: [
        ["identify", "connected visual elements"],
        ["compare", "a group or an individual point or area of interest"],
      ],
    },
    {
      id: "text",
      name: "Text",
      n: 1434,
      def: "Words or sentences that answer questions about the data: descriptions, explanations of events, or specific values.",
      here: "A sentence describes the result: a positive correlation between test scores and time spent studying.",
      usage: [
        ["present", "additional context"],
        ["identify, summarize, or compare", "visual elements"],
      ],
    },
    {
      id: "glyph",
      name: "Glyph",
      n: 270,
      def: "Symbols or shapes that identify specific objects or categories. Glyphs were most prominent in maps.",
      here: "Crosses and circles mark the students who underperform and outperform their peers. Shown alone, they are shapes only.",
      usage: [
        ["identify", "visual elements"],
        ["compare", "visual elements"],
      ],
    },
    {
      id: "color",
      name: "Color",
      n: 259,
      def: "Any property of color, generally hue, used to answer questions about the data. Color that is already part of the chart's encoding, such as categories with a legend, is not an annotation.",
      here: "Red and green set the two kinds of glyphs apart. The color adds no new information; it emphasizes the glyphs.",
      usage: [
        ["identify", "visual elements"],
        ["compare", "visual elements"],
      ],
    },
    {
      id: "indicator",
      name: "Indicator",
      n: 424,
      def: "Marks that indicate trends, statistics, or thresholds in the data, such as a trend line or a reference line.",
      here: "Two lines: a dotted trend line shows the correlation, and a dashed line marks the national average of 92.",
      usage: [
        ["identify", "statistics and threshold values"],
        ["summarize", "trends in data"],
        ["compare", "trends in data"],
      ],
    },
    {
      id: "geometric",
      name: "Geometric",
      n: 61,
      def: "A change to an area of the chart that highlights it, such as enlarging a pie slice or zooming into one part.",
      here: "A zoom box enlarges the top right of the plot, with each point labeled.",
      usage: [["identify", "a group or an individual point or area of interest"]],
    },
  ];

  // Fig. 5, Why?: the filled squares, in the order present, identify, summarize, compare.
  // Glyph's squares are identify and summarize, as printed, though its listed usages
  // (and Sect. 5.2.1) name identify and compare.
  const TASKS = [
    { id: "present", name: "Present", kind: "Consume" },
    { id: "identify", name: "Identify", kind: "Query" },
    { id: "summarize", name: "Summarize", kind: "Query" },
    { id: "compare", name: "Compare", kind: "Query" },
  ];
  const WHY = {
    enclosure: [0, 1, 0, 1],
    connector: [0, 1, 0, 1],
    text: [1, 1, 1, 1],
    glyph: [0, 1, 1, 0],
    color: [0, 1, 0, 1],
    indicator: [0, 1, 1, 1],
    geometric: [0, 1, 0, 0],
  };
  // Sect. 5.1, in the paper's words where it has them.
  const TASK_NOTE = {
    present: "Only text presents additional context, which Brehmer and Munzner call a consume task.",
    identify: "All seven types can be used for identify tasks.",
    summarize: "Text, glyphs, and indicators give the capability to summarize.",
    compare: "Most types can be used for compare tasks.",
  };

  // Fig. 5, How?: chart types with their counts, as printed (they sum to 1,888).
  const CHARTS = [
    ["Line chart", 326], ["Bar chart", 294], ["Map", 267], ["Scatterplot", 248],
    ["Pie chart", 247], ["Bubble chart", 96], ["Donut chart", 77], ["Area chart", 74],
    ["Treemap", 64], ["Histogram", 52], ["Graph", 41], ["Gantt chart", 35],
    ["Density map", 35], ["Radar chart", 32],
  ];
  // Fig. 5, How?: usage bands read from the figure's colors.
  // 0 = no box, 1 = 6–25%, 2 = 26–50%, 3 = 51+%. Columns follow CHARTS.
  const HOW = {
    enclosure: [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 3, 3, 2],
    connector: [2, 1, 2, 1, 0, 1, 0, 2, 0, 1, 1, 1, 2, 1],
    text:      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3],
    glyph:     [1, 1, 2, 0, 0, 0, 0, 1, 0, 0, 2, 1, 1, 1],
    color:     [1, 1, 1, 1, 0, 2, 0, 1, 0, 1, 1, 1, 1, 1],
    indicator: [2, 2, 1, 3, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0],
    geometric: [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  };
  const BANDS = ["below 6%", "6–25%", "26–50%", "51% or more"];

  // Sect. 5.3: charts with at least one annotation of each source, out of 1,888.
  const SOURCES = [
    {
      id: "internal",
      name: "Internal",
      n: 973,
      approx: "∼52%",
      def: "Taken directly from the dataset, with no calculation and no outside input: exact values or text from the data.",
      ex: "The value labels in Fig. 4's zoom box, and the labels on the line in Fig. 1c and the slices in Fig. 1f.",
    },
    {
      id: "derived",
      name: "Derived",
      n: 330,
      approx: "∼17%",
      def: "Calculated from the chart's data without directly showing its values: a regression, an average, a confidence interval, clusters.",
      ex: "The correlation line in Fig. 4. Indicators showing correlations were the most frequent derived annotations.",
    },
    {
      id: "external",
      name: "External",
      n: 994,
      approx: "∼53%",
      def: "Made from a source outside the chart's data: another file, the internet, or what the author knows.",
      ex: "The national-average line and its label in Fig. 4, and the notes on events in Fig. 1c and 1e.",
    },
  ];
  // Table 1: share of 3,610 coded instances, by source (rows) and type (columns, TYPES order).
  const TABLE1 = {
    internal: [5.2, 1.6, 26.5, 0.5, 0.2, 0.3, 0.1],
    derived:  [0.1, 0.1, 1.4, 1.4, 0.8, 6.9, 0],
    external: [11.4, 9.3, 15.8, 5.6, 6.2, 5, 1.6],
  };

  // Fig. 1: six charts from the corpus, with the Why/How/What rows printed under each.
  const FIG1 = [
    { k: "a", kind: "Bar chart", rows: [["compare", "indicator + enclosure + connector + text", "external + derived"]],
      cap: "Connector, indicator, enclosure, and text annotations help compare between years.",
      alt: "Stacked bar chart for 2017 to 2019 with totals of 22, 37, and 55, arrows between bars, and the differences +73% and +57% set in ellipses." },
    { k: "b", kind: "Scatterplot", rows: [["identify", "enclosure + text", "external"], ["identify", "connector + text", "external"]],
      cap: "Text, connector, and enclosure annotations help identify individual points and groups of points.",
      alt: "Scatterplot of positivity rate against number of tests, with two ellipses around weekend and weekday clusters, quadrant labels, and an arrow to a labeled point." },
    { k: "c", kind: "Line chart", rows: [["identify", "glyph + text", "internal"], ["present", "connector + text", "external"]],
      cap: "Glyph and text annotations help identify points of interest; text and connectors present key events.",
      alt: "Line chart of webinar attendees over time, with circled points labeled 95, 95, and 78, and notes on attendance at the 10-minute mark, the start of the Q&A, and sign-off." },
    { k: "d", kind: "Node-link diagram", rows: [["identify", "enclosure + geometric", "external"]],
      cap: "An enclosure and a geometric annotation help identify the area of interest.",
      alt: "A large tree diagram with one region outlined by a rectangle and enlarged in an inset." },
    { k: "e", kind: "Map", rows: [["present", "connector + text", "external"]],
      cap: "Connector and text annotations present key events on a journey and critique the visualization.",
      alt: "A world map of a voyage, surrounded by many short notes with lines pointing into the map." },
    { k: "f", kind: "Pie chart", rows: [["identify", "geometric + color", "external"], ["present", "text", "internal"]],
      cap: "Text presents exact values from the dataset; color and a geometric annotation identify the lacrosse slice.",
      alt: "Pie chart of sport popularity with soccer 45.5%, baseball 27.3%, and surfing 9.1% in gray, and a pulled-out blue lacrosse slice at 18.2%." },
  ];

  // Sect. 6 and Figs. 6, 7, and 2. In each figure, (b) and (c) each add one task's annotations
  // to the bare chart (a), and (d) shows them all. Every ensemble below is a row the figure prints
  // under its panel; `goal`, `roles`, and `src` paraphrase the paper's Sect. 6 text.
  // `marks` outline where the ensemble sits in the panel, as fractions of its width and height:
  // ["r", x0, y0, x1, y1] for an area, ["l", x0, y0, x1, y1] for a line. They were found by
  // comparing each panel with the bare chart (a), then checked by eye.
  const CASES = [
    {
      id: "economist",
      source: "The Economist",
      fig: "Fig. 6",
      img: "fig6",
      w: 1434, h: 886,
      chart: "Line chart",
      topic: "Deaths of despair in the US, 1979 to 2019",
      about: "Deaths from drug overdoses, alcohol-related illnesses, and suicide, per 100,000 people, for everyone and for whites aged 45 to 64.",
      story: "The article is about what drove deaths of despair in the US. The annotations point to an outside event, show that deaths had been falling, and compare where that decline stopped.",
      ens: [
        { step: 1, why: "identify", goal: "when the painkiller OxyContin was introduced",
          how: "indicator + text", roles: "A vertical line marks the year; text says what happened then.",
          what: "external", src: "The event is not in the chart's data; it comes from the article.",
          marks: [["l", 0.421, 0.07, 0.421, 0.9], ["r", 0.42, 0.105, 0.59, 0.19]] },
        { step: 2, why: "summarize", goal: "the decline in deaths of despair before the opioid epidemic",
          how: "indicator + text", roles: "Dashed trend lines carry the earlier decline forward; text states it.",
          what: "derived", src: "The trend lines are computed from the chart's data. Their text comes from the article.",
          marks: [["l", 0.097, 0.458, 0.497, 0.793], ["l", 0.097, 0.825, 0.858, 0.888], ["r", 0.13, 0.29, 0.345, 0.415], ["l", 0.14, 0.415, 0.14, 0.825], ["r", 0.73, 0.82, 0.868, 0.865]] },
        { step: 2, why: "compare", goal: "the area of difference between the trends",
          how: "color + enclosure", roles: "Gray shading encloses the gap between the trend line and what happened.",
          what: "external", src: "From the article, not the chart's data.",
          marks: [["r", 0.398, 0.63, 0.503, 0.8]] },
        { step: 2, why: "compare", goal: "the premature halt in the declining trend",
          how: "connector + text", roles: "A line connects the shaded area to a note that explains it.",
          what: "external", src: "From the article, not the chart's data.",
          marks: [["r", 0.44, 0.29, 0.63, 0.415], ["l", 0.447, 0.415, 0.447, 0.66]] },
      ],
      steps: [
        { title: "The bare chart", text: "Every annotation removed. The lines are there, but nothing tells you what to look at." },
        { title: "Identify an outside event", text: "The first task: show readers when something outside the data happened." },
        { title: "Summarize and compare the trends", text: "Three ensembles: one summarizes the earlier decline, two compare what happened next." },
        { title: "The annotated chart", text: "All four ensembles together. Point at one to find it." },
      ],
    },
    {
      id: "wsj",
      source: "The Wall Street Journal",
      fig: "Fig. 7",
      img: "fig7",
      w: 679, h: 465,
      chart: "Waterfall chart",
      topic: "Inflation during the COVID-19 pandemic",
      about: "The change in the consumer-price index from a year earlier, with bars for months when inflation rose and fell.",
      story: "The article discusses the pandemic's effect on inflation and a 2% target. The annotations make the target visible and explain the swings around it.",
      ens: [
        { step: 1, why: "identify", goal: "the 2% target the article discusses",
          how: "color + enclosure + text", roles: "The enclosure holds the area below 2%, color draws the eye to it, and text names the threshold.",
          what: "external", src: "The target comes from the article, not the chart's data.",
          marks: [["r", 0.033, 0.585, 0.875, 0.925]] },
        { step: 2, why: "present", goal: "the temporary swings below and above the target",
          how: "connector + text", roles: "Notes from the article give the context; connectors tie each note to its bars.",
          what: "external", src: "From the article, not the chart's data.",
          marks: [["r", 0.238, 0.245, 0.462, 0.45], ["r", 0.152, 0.45, 0.31, 0.68], ["r", 0.528, 0.245, 0.72, 0.45], ["r", 0.62, 0.45, 0.765, 0.612], ["r", 0.875, 0.18, 0.995, 0.41]] },
      ],
      steps: [
        { title: "The bare chart", text: "Every annotation removed. The bars are there, but not the target they are measured against." },
        { title: "Identify a threshold", text: "The first task: make the 2% target visible." },
        { title: "Present the fluctuations", text: "The second task: explain why inflation moved below and above the target." },
        { title: "The annotated chart", text: "Both ensembles together. Point at one to find it." },
      ],
    },
    {
      id: "wapo",
      source: "The Washington Post",
      fig: "Fig. 2",
      img: "fig2",
      w: 987, h: 489,
      chart: "Line chart",
      topic: "COVID-19 peaks, from an article on the Omicron variant",
      about: "Cases, deaths, and hospitalizations as a percentage of the January 2021 peak.",
      story: "The article is about the Omicron variant. The annotations pick out the peak of each COVID-19 wave and add the article's numbers and context.",
      ens: [
        { step: 1, why: "identify", goal: "the peaks of the COVID-19 waves",
          how: "color + enclosure + text", roles: "Shaded bands enclose each wave, and labels name them: the January 2021 peak, Delta, and Omicron.",
          what: "external", src: "From the article, not the chart's data.",
          marks: [["r", 0.075, 0.065, 0.2, 0.925], ["r", 0.595, 0.065, 0.756, 0.925], ["r", 0.86, 0.065, 0.99, 0.925]] },
        { step: 2, why: "present", goal: "the numbers and context behind the peaks",
          how: "text + connector", roles: "Notes describe the peaks; arrows tie each note to the point it describes.",
          what: "internal + external", src: "The context comes from the article; some numbers in the notes are taken straight from the dataset.",
          marks: [["r", 0.218, 0.32, 0.39, 0.6], ["r", 0.135, 0.5, 0.222, 0.675], ["r", 0.762, 0.345, 0.915, 0.66], ["r", 0.9, 0.46, 0.99, 0.675]] },
      ],
      steps: [
        { title: "The bare chart", text: "Every annotation removed: axes, labels, lines, legend, and gridlines remain." },
        { title: "Identify the peaks", text: "The first task: pick out each wave so readers can find it." },
        { title: "Present context", text: "The second task: bring in the article's numbers and explanation." },
        { title: "The annotated chart", text: "Both ensembles together. Point at one to find it." },
      ],
    },
  ];

  // Fig. 4, read from the vector drawing in the PDF. Hours studied, test score.
  // The zoom box prints the values for hours 10–12, which these match.
  const FIG4 = {
    groups: {
      A: [60, 65, 92, 80, 58, 97, 102, 107, 108, 114, 105, 125],
      B: [65, 70, 80, 85, 90, 95, 100, 105, 89, 101, 120, 120],
      C: [55, 75, 67, 90, 93, 82, 107, 97, 117, 117, 128, 132],
    },
    // [hours, group] of the students marked as under- and outperforming their peers
    under: [[1, "C"], [3, "C"], [5, "A"], [6, "C"], [9, "B"], [10, "B"], [11, "A"]],
    over: [[3, "A"], [7, "C"], [9, "C"], [11, "C"], [12, "C"]],
    trend: [[1, 63.1], [12, 121.6]],
    average: 92,
    box: { x0: 9.74, x1: 12.72, y0: 96, y1: 138.1 },
    zoom: { x0: 8.13, x1: 13.84, y0: 4.4, y1: 75.9, dx: [9.5, 12.5], dy: [100, 135] },
    text: ["There is a positive correlation between", "test scores and time spent studying"],
    arrowTo: [6.75, 95.1],
  };

  return { FIG4, TYPES, TASKS, WHY, TASK_NOTE, CHARTS, HOW, BANDS, SOURCES, TABLE1, FIG1, CASES };
})();
