/* =====================================================================
   4MLClass content: Presentation 1 "Machine Learning Algorithms"
   (masterclass deck, slides 28 to 200), in slide order and slide wording.
   Each chapter: steps [{ t:title, s:slides, h:html }] and a check (quiz).
   In every quiz item the CORRECT answer is written FIRST; the app shuffles
   the options with a fixed seed, so its position is random.
   (c) 2026 Periklis Gogas, EMEF Lab.
   ===================================================================== */
(function () {
  'use strict';
  const R = (id, label) => ' <button type="button" class="btn-ghost btn-small reveal-btn" data-reveal="' + id + '">' + (label || 'Show the answer') + '</button>';

  const P1 = {
    id: 'p1', title: 'Machine Learning Algorithms', sub: 'Presentation 1 &middot; slides 28 to 200 &middot; 13 chapters', chapters: []
  };
  const ch = c => P1.chapters.push(c);

  /* ------------------------------------------------------------ 1 */
  ch({
    title: 'Classification or regression?', short: 'Classification or regression', slides: '28-38',
    steps: [
      { t: 'First things first', s: '28-30', h: `
        <ul><li><b>Before we start</b> anything in AI-ML.</li>
        <li>The <b>first question</b> is always <span class="arrow">→</span> what kind of problem do I have?
          <ol><li><b>Classification</b></li><li><b>Regression</b></li></ol></li>
        <li>It is important because it determines:
          <ul><li>Preparation and <b>cleaning</b> of our data.</li><li>Various <b>checks</b> that need to be performed on the data.</li></ul></li></ul>
        <div data-fig="regVsClass"></div>` },
      { t: 'Classification: discrete variables', s: '31-33', h: `
        <p><b>Definition: Classification</b> <span class="arrow">→</span> when we predict a <b>discrete variable</b>. But what is a discrete variable?</p>
        <h4>Discrete variable</h4>
        <ul><li>It takes <b>2 or more specific</b> values.</li>
        <li>It has <b>"gaps"</b> <span class="arrow">→</span> there are no intermediate values between two values. For example, a family can have 2 or 3 children, but not 2.5 children, live on the 3rd or 4th floor, but not on the 4.3rd floor.</li>
        <li>Usually expressed in <b>whole numbers</b>. But there are exceptions <span class="arrow">→</span> shoe size: 41, 42, 43.5, etc. but not 42.27.</li></ul>
        <div class="key">Can you think of some examples?</div>
        <h4>Examples of discrete variables</h4>
        <div class="cols2"><div><b>1. Numerical</b><ul><li>The number of <b>students</b> in a room.</li><li>How many times we get "<b>heads</b>" tossing a coin?</li><li>The result of rolling a <b>die</b>.</li></ul></div>
        <div><b>2. Qualitative</b><ul><li>Marital status: <b>single, married</b>.</li><li>Credit card transaction: <b>fraudulent</b> or <b>not</b>.</li><li>The type of movies we watch on Netflix: <b>action</b>, <b>romance</b>, <b>comedies</b>, etc.</li><li>The credit rating of countries: <b>AAA</b>, <b>AA</b>, <b>BBB</b>, etc.</li><li>Color selection: green, blue, red, yellow.</li></ul></div></div>` },
      { t: 'Regression: continuous variables', s: '34-36', h: `
        <p><b>Definition: Regression</b> <span class="arrow">→</span> when we predict a <b>continuous variable</b>. But what is a continuous variable?</p>
        <p>A <b>continuous variable</b> is a quantitative variable that can take on <b>any value</b> within a specific interval.</p>
        <h4>Main features</h4>
        <ul><li><b>It results from measurement:</b> we usually use an instrument (ruler, scales, stopwatch, etc.) to find its value.</li>
        <li><b>Infinite values:</b> between any two values (e.g. between 1.70m and 1.71m), there are theoretically infinite other values (1.705m, 1.7055m and so on).</li>
        <li><b>Divisibility:</b> it can be divided into smaller and smaller subdivisions (units of measurement).</li></ul>
        <div class="key"><b>Hint:</b> if it can take any decimal value <span class="arrow">→</span> it is continuous! e.g. GDP growth 2.374%.</div>
        <h4>Examples of continuous variables</h4>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Variable</th><th>Why is it continuous?</th></tr></thead><tbody>
        <tr><td>Height</td><td>A person can be 1.75m, 1.752m or 1.7523m.</td></tr>
        <tr><td>Weight</td><td>It is measured in grams, milligrams, etc. (e.g. 70.5 kilograms).</td></tr>
        <tr><td>Time</td><td>The finishing time in a race (e.g. 10.24 seconds).</td></tr>
        <tr><td>Temperature</td><td>It could be 36.6°C or 36.65°C.</td></tr>
        <tr><td>Distance</td><td>The distance between two cities (e.g. 502.34 kilometers).</td></tr></tbody></table></div>
        <div class="key">Can you think of other examples?</div>` },
      { t: 'The million dollar question!', s: '37', h: `
        <p>What kind of variables are:</p>
        <ul class="qa">
        <li>The grade in a university course? (A, B, C, D, F)` + R('mq1') + ` <span class="reveal-body" id="mq1">→ Discrete</span></li>
        <li>Your average GPA?` + R('mq2') + ` <span class="reveal-body" id="mq2">→ Continuous</span></li>
        <li>The choice of car brand? (Mazda, Fiat, BYD, etc.)` + R('mq3') + ` <span class="reveal-body" id="mq3">→ Discrete</span></li>
        <li>The demand for electricity?` + R('mq4') + ` <span class="reveal-body" id="mq4">→ Continuous</span></li></ul>` },
      { t: 'Conclusion', s: '38', h: `
        <p>If my goal is to predict:</p>
        <div class="key"><b>Discrete variable</b> <span class="arrow">→</span> I use <b>Classification</b><br><b>Continuous variable</b> <span class="arrow">→</span> I use <b>Regression</b></div>` }
    ],
    quiz: [
      { q: 'A bank wants to predict whether a loan will default (yes or no). What kind of problem is this?', a: ['Classification', 'Regression', 'Clustering', 'Reinforcement learning'], e: 'Default is a discrete variable with 2 values, so we use classification.' },
      { q: 'Which of these variables is continuous?', a: ['GDP growth of 2.374%', 'The number of students in a room', 'The credit rating of a country (AAA, AA, BBB)', 'The result of rolling a die'], e: 'If it can take any decimal value, it is continuous.' },
      { q: 'Shoe sizes are 41, 42, 43.5 but never 42.27. What kind of variable is shoe size?', a: ['Discrete: it takes specific values with gaps between them', 'Continuous: it has decimals', 'Continuous: it results from measurement', 'Neither: it is qualitative'], e: 'Discrete variables are usually whole numbers, but there are exceptions such as shoe size: specific values with gaps.' },
      { q: 'Why is "classification or regression?" the first question in any ML project?', a: ['It determines how we prepare and clean the data and which checks we perform', 'It decides how many observations we need', 'It tells us which programming language to use', 'It is only needed for neural networks'], e: 'The slide: it determines the preparation and cleaning of our data and the checks that need to be performed.' }
    ]
  });

  /* ------------------------------------------------------------ 2 */
  ch({
    title: 'Types of Machine Learning', short: 'Types of ML', slides: '39-42',
    steps: [
      { t: 'ML algorithm families', s: '39-40', h: `
        <div class="cols3">
          <div class="fam sup"><h4>Supervised Learning</h4><p>Training an algorithm for classification or regression with a <b>labeled</b> dataset.</p><p style="margin-top:8px">Examples are provided.<br>Target y provided.</p></div>
          <div class="fam uns"><h4>Unsupervised Learning</h4><p>We train an algorithm to find clusters using an <b>unlabeled</b> dataset.</p><p style="margin-top:8px">There are no examples.<br>No target y.</p></div>
          <div class="fam rei"><h4>Reinforcement Learning</h4><p>We train an <b>agent</b> to perform actions correctly based on <b>reward</b> or <b>punishment</b>.</p><p style="margin-top:8px">Learning from rewards and punishments.</p></div>
        </div>` },
      { t: 'Example: classifying geometric shapes', s: '41', h: `
        <div class="cols3">
          <div class="mapcol"><h5>Supervised</h5>The robot gets a <b>label</b>: "A cube has 6 sides that are square". <br><span class="arrow">→</span> "I understand."</div>
          <div class="mapcol"><h5>Unsupervised</h5>No labels. The robot looks at the shapes and says: <br><span class="arrow">→</span> "These look like groups."</div>
          <div class="mapcol"><h5>Reinforcement</h5>The robot tries something and asks: "Does this work?" <br><span class="arrow">→</span> the answer is a reward or a punishment.</div>
        </div>` },
      { t: 'Machine Learning: methods map', s: '42', h: `
        <div class="cols3">
          <div class="mapcol"><h5>Supervised learning</h5><div class="sub">Classification</div>Image classification, fraud detection, customer retention, diagnostics<div class="sub">Regression</div>Forecasting, predictions, process optimization, new insights</div>
          <div class="mapcol"><h5>Unsupervised learning</h5><div class="sub">Clustering</div>Recommender systems, targeted marketing, customer segmentation<div class="sub">Dimensionality reduction</div>Meaningful compression, structure discovery, feature elicitation, big data visualisation</div>
          <div class="mapcol"><h5>Reinforcement learning</h5><div class="sub">Decisions and control</div>Real-time decisions, game AI, robot navigation, skill acquisition, learning tasks</div>
        </div>` }
    ],
    quiz: [
      { q: 'A data set has many variables but no target y. Which family of algorithms do we use?', a: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Regression'], e: 'No examples, no target y: unsupervised learning, which finds clusters.' },
      { q: 'In supervised learning the data set contains...', a: ['Labels: the target y is provided for every example', 'Only rewards and punishments', 'No target variable', 'Only one variable'], e: 'Supervised learning trains with a labeled dataset: examples are provided.' },
      { q: 'An agent learns to act correctly from rewards and punishments. This is...', a: ['Reinforcement learning', 'Clustering', 'Classification', 'Dimensionality reduction'], e: 'Reinforcement learning trains an agent with reward or punishment.' },
      { q: 'In the methods map, customer segmentation belongs to...', a: ['Unsupervised learning: clustering', 'Supervised learning: classification', 'Supervised learning: regression', 'Reinforcement learning'], e: 'We group customers without labels: clustering.' }
    ]
  });

  /* ------------------------------------------------------------ 3 */
  ch({
    title: 'Reinforcement learning', short: 'Reinforcement learning', slides: '44-53',
    steps: [
      { t: 'Training by rewards and punishments', s: '44-46', h: `
        <p>An <b>agent</b> interacts with its <b>environment</b>. Every action brings a <b>reward or a punishment</b>, and the agent is trained by them.</p>
        <div data-fig="rlLoop"></div>
        <div class="ex"><b>Example: Alexa</b><br>"At 5:30 am I turned the living room lights off since you are not normally using them at that time. Was I right?" <span class="arrow">→</span> Yes or No <span class="arrow">→</span> <b>She learns!</b></div>` },
      { t: 'Mouse in the maze', s: '47-48', h: `
        <p>Learn to find the cheese: the mouse learns the best path by trial and error.</p>
        <ul><li><b>Electricity</b> (punishment) <span class="arrow">→</span> dead <span class="arrow">→</span> <b>avoid</b></li>
        <li><b>Water</b> (reward) <span class="arrow">→</span> power <span class="arrow">→</span> <b>seek</b></li>
        <li><b>Cheese</b> <span class="arrow">→</span> the goal.</li></ul>
        <p>The same with a dog: the <b>agent</b> (dog) takes <b>actions</b>; the <b>environment</b> (owner) gives <b>rewards</b> (a treat) and <b>observations</b>.</p>` },
      { t: 'Game of Pong: the machine learns to play tennis', s: '49-51', h: `
        <p>The <b>agent</b> moves its paddle <b>UP</b> or <b>DOWN</b>. It sees the <b>state</b> of the game (the ball, the paddles). Missing the ball is a <b>punishment</b>; winning the point is a <b>reward</b>.</p>
        <h4>Recorded actions and learning</h4>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Recorded actions</th><th>Result</th></tr></thead><tbody>
        <tr><td>UP, UP, UP, DOWN, UP, DOWN, DOWN, DOWN</td><td>WIN → R</td></tr>
        <tr><td>DOWN, UP, DOWN, UP, DOWN, UP, DOWN, UP, DOWN</td><td>LOSS → P</td></tr>
        <tr><td>DOWN, DOWN, DOWN, UP, DOWN, UP, UP, UP, DOWN</td><td>WIN</td></tr>
        <tr><td>DOWN, UP, UP, UP, UP, DOWN, UP, DOWN, UP, DOWN</td><td>WIN</td></tr>
        <tr><td>UP, UP, DOWN, DOWN, DOWN, UP, DOWN, UP</td><td>WIN</td></tr>
        <tr><td>DOWN, UP, DOWN, UP, DOWN, DOWN, DOWN, UP, DOWN</td><td>LOSS</td></tr></tbody></table></div>` },
      { t: 'Create policies', s: '52', h: `
        <div class="cols2"><div class="ex"><b>LOSS</b> <span class="arrow">→</span> Don't do it again <span class="arrow">→</span> <b>decrease</b> the probability</div>
        <div class="key"><b>WIN</b> <span class="arrow">→</span> Do it again <span class="arrow">→</span> <b>increase</b> the probability</div></div>
        <p>After many games, the actions that lead to wins become more likely: this is the <b>policy</b> the agent learns.</p>` },
      { t: 'Reinforcement learning applications', s: '53', h: `
        <ul><li><b>Algorithmic trading</b></li><li><b>Gaming</b>: human vs computer</li><li><b>Robotics</b></li></ul>` }
    ],
    quiz: [
      { q: 'In Pong, a sequence of actions ends with a LOSS. What does the policy do?', a: ['Decreases the probability of those actions', 'Increases the probability of those actions', 'Deletes the game from the data', 'Nothing: only wins are used'], e: 'LOSS → don\'t do it again → decrease the probability.' },
      { q: 'For the mouse in the maze, electricity is...', a: ['A punishment, so the mouse learns to avoid it', 'A reward, so the mouse seeks it', 'The goal of the game', 'A label of the data'], e: 'Electricity (punishment) → avoid. Water (reward) → seek.' },
      { q: 'Alexa asks "Was I right?" after turning off the lights. Why?', a: ['Your Yes or No is the reward or punishment she learns from', 'She needs a label for clustering', 'She checks the electricity price', 'She collects data for a regression'], e: 'Interaction, then reward or punishment, then training: she learns!' }
    ]
  });

  /* ------------------------------------------------------------ 4 */
  ch({
    title: 'Unsupervised learning: K-Means and hierarchical clustering', short: 'Unsupervised learning', slides: '54-65', inter: 'K-Means, dendrogram',
    steps: [
      { t: 'Learning patterns from the data', s: '54-56', h: `
        <p>A workflow where a model explores <b>unlabeled data</b> to discover hidden patterns:</p>
        <div class="flow"><span>Unlabeled data</span><i>→</i><span>Model training</span><i>→</i><span>Trained model</span><i>→</i><span>Pattern discovery: clustering</span></div>
        <div class="ex"><b>Example:</b> a system to group animals <b>without labels (no Y)</b>. We give it only the variables (Xs), not "cat or not cat". It learns from the data and clusters them into Group A, Group B, Group C.</div>` },
      { t: 'K-Means: how the algorithm works', s: '57-59', fig: 'kmeans', h: `
        <p><b>Start:</b> original unclustered data. <b>End:</b> clustered data. <b>How?</b></p>
        <ul><li>Clustering problem.</li><li>We choose <b>k = 2</b> clusters.</li><li>Start with <b>all blue</b>.</li><li>Select <b>2 random</b> points (centers).</li></ul>
        <ol><li><b>Connect</b> them.</li><li>Draw the <b>middle perpendicular</b> line.</li><li><b>Separates</b> data into <b>two classes</b>.</li><li>Find the <b>center of gravity</b> for both classes (average).</li><li><b>Repeat</b> until centers stop moving.</li></ol>
        <div data-fig="kmeans"></div>` },
      { t: 'Hierarchical clustering', s: '60-61', fig: 'hclust', h: `
        <ul><li>Data: <b>A, B, C, D, E, F</b></li>
        <li>Find the <b>closest</b> elements (Euclidean distance or else) <span class="arrow">→</span> 1st group <b>E, F</b></li>
        <li><b>Continue</b> with the element <b>closest</b> to this <span class="arrow">→</span> 2nd group <b>D, E, F</b></li>
        <li>Continue until <b>all</b> elements are <b>included</b>.</li>
        <li><b>Select</b> the number of <b>clusters</b> you want.</li>
        <li><b>Cut the dendrogram</b> at the number of clusters we want (for example at 2 or at 4).</li></ul>
        <div data-fig="hclust"></div>` },
      { t: 'Real example: USArrests', s: '62', h: `
        <p>Data set <b>USArrests</b>, which contains statistics in arrests per 100,000 residents for assault, murder, and rape in each of the <b>50 US states</b>.</p>
        <p>Hierarchical clustering gives a dendrogram of the 50 states. Cutting it at different heights gives <b>2, 3 or 4 clusters</b> of states.</p>` },
      { t: 'Applications', s: '63', h: `
        <ul><li><b>Credit ratings</b></li><li><b>Risk–return ratios</b> of assets</li>
        <li><b>Personalized marketing</b> (Target supermarket) for
          <ul><li><b>Market research and customer segmentation</b></li>
          <li><b>Niche targeting:</b> a brand might see a broad cluster of "Outdoor Enthusiasts", but hierarchical clustering reveals sub-clusters of "Hardcore Mountain Climbers" vs. "Weekend Campers".</li>
          <li><b>Product recommendation:</b> grouping products that are frequently bought together in nested categories to optimize "Frequently Bought Together" engines.</li></ul></li>
        <li><b>Social network analysis</b> for
          <ul><li><b>Community detection:</b> it identifies core groups within a social network and shows how these small circles merge into larger social movements or "echo chambers".</li>
          <li><b>Influencer mapping:</b> finding the central nodes that connect different seemingly irrelevant groups.</li></ul></li></ul>` },
      { t: 'Why choose hierarchical over other methods?', s: '64-65', h: `
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Feature</th><th>Benefit</th></tr></thead><tbody>
        <tr><td>No pre-set k</td><td>You don't need to guess the number of clusters (k) beforehand.</td></tr>
        <tr><td>Dendrograms</td><td>You get a visual map of how every single data point relates to the others.</td></tr>
        <tr><td>Flexibility</td><td>It works with any distance metric (Euclidean, Manhattan, etc.).</td></tr></tbody></table></div>
        <div class="ex"><b>A quick tip:</b> while great for insight, hierarchical clustering can be slow on massive datasets (it's computationally "expensive"). For millions of rows, data scientists often use it on a sample first to determine the right number of clusters before switching to a faster method.</div>
        <h4>Unsupervised learning applications</h4>
        <ul><li><b>Fraud detection</b></li><li><b>Recommendations</b> (e.g. "Recommended for you" in Amazon)</li><li><b>Dimensionality reduction</b></li></ul>` }
    ],
    quiz: [
      { q: 'In K-Means with k = 2, after we connect the two centers, what do we draw?', a: ['The middle perpendicular line between them', 'A regression line through all points', 'A circle around each center', 'The dendrogram'], e: 'Connect them, draw the middle perpendicular line, which separates the data into two classes.' },
      { q: 'When does K-Means stop?', a: ['When the centers stop moving', 'After exactly k rounds', 'When all points are blue', 'When the Gini impurity is zero'], e: 'Repeat until centers stop moving.' },
      { q: 'How does K-Means move a center?', a: ['To the center of gravity (average) of the points in its class', 'To the point farthest from it', 'To a new random point', 'It never moves'], e: 'Find the center of gravity for both classes (average).' },
      { q: 'An advantage of hierarchical clustering over K-Means is that...', a: ['You don\'t need to choose the number of clusters k beforehand', 'It is always faster on millions of rows', 'It needs labels', 'It works only with Euclidean distance'], e: 'No pre-set k: cut the dendrogram at the number of clusters you want. But it can be slow on massive data sets.' },
      { q: 'In the A to F example, E and F merge first. Why?', a: ['They are the closest elements', 'They are the farthest apart', 'They are the first letters', 'They have the same label'], e: 'Find the closest elements (Euclidean distance or else) → 1st group E, F.' }
    ]
  });

  /* ------------------------------------------------------------ 5 */
  ch({
    title: 'Supervised learning', short: 'Supervised learning', slides: '66-77',
    steps: [
      { t: 'What is supervised learning?', s: '66-68', h: `
        <p>A workflow where a model learns from <b>labeled examples</b> to make predictions:</p>
        <div class="flow"><span>Labeled data: examples</span><i>→</i><span>Model training</span><i>→</i><span>Trained model</span><i>→</i><span>Classification or regression</span></div>
        <div class="cols2"><div class="mapcol"><h5>1. Unsupervised learning</h5>Data <span class="arrow">→</span> 1 or more variables.<br>Goal <span class="arrow">→</span> clustering.</div>
        <div class="mapcol"><h5>2. Supervised learning</h5>Data <span class="arrow">→</span> 1 or more variables (independent) and <b>1 target variable (dependent)</b>.<br>Goal <span class="arrow">→</span> forecast the target dependent variable <span class="arrow">→</span> classification or regression.</div></div>` },
      { t: 'Example of prediction in supervised learning', s: '69', h: `
        <p>Say my goal is to make a model that recognizes:</p>
        <ul><li><b>Growth</b> or <b>recession</b> periods of the GDP.</li><li><b>Fraudulent</b> or not transactions.</li><li><b>Insider trading</b> or not in stock market.</li><li><b>Cats</b> from other animals.</li></ul>
        <p>Is it classification or regression?` + R('sl1') + ` <span class="reveal-body" id="sl1">→ Classification: every target is discrete.</span></p>
        <div class="ex"><b>Example</b> <span class="arrow">→</span> I have a sample of <b>n = 100</b> with:<ul><li>Animal photos <span class="arrow">→</span> independent variable (X).</li><li>A label of whether or not the specific animal is a cat <span class="arrow">→</span> dependent variable (Y).</li></ul>So we have the labels/examples in our sample <span class="arrow">→</span> <b>supervised learning problem!</b></div>` },
      { t: 'The training step', s: '70-73', h: `
        <p>The model sees the observations of the data set one by one: the <b>data</b> (the photo) and the <b>label</b>.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Observation</th><th>Data (photo)</th><th>Label</th></tr></thead><tbody>
        <tr><td>Observation 1</td><td>a cat</td><td><b>CAT</b></td></tr>
        <tr><td>Observation 3</td><td>a dog: this is Pepe!</td><td><b>NOT CAT</b></td></tr>
        <tr><td>...</td><td>...</td><td>...</td></tr>
        <tr><td>Observation 100</td><td>a rooster: Julius Caesar!!!</td><td><b>NOT CAT</b></td></tr></tbody></table></div>
        <p><b>End of training!</b> So far:</p>
        <ol><li>I have <b>trained</b> my model with some ML algorithm.</li><li>I used data with <b>labels</b>.</li><li>I showed off my pets :P</li><li>The model is <b>ready</b> to use in <b>new unknown</b> data!</li><li>Thus, from the <b>train</b> step we move to the <b>test</b> step.</li></ol>` },
      { t: 'The testing step', s: '74', deep: [{app: 'sim', id: 'cross-validation', t: 'Cross-Validation'}, {app: 'sim', id: 'data-leakage', t: 'Data Leakage'}], h: `
        <p>Many <b>new photos</b> are fed into our model using the <b>test (hold-out) set</b>. The trained model has never seen them.</p>
        <div class="flow"><span>New data: a rabbit photo</span><i>→</i><span>Trained model</span><i>→</i><span>"This is NOT a cat"</span><i>→</i><span>Correct classification of an unknown observation</span></div>
        <div class="key">The test (hold-out) set is used <b>once</b>, at the end, to see how the model works on data it has never seen.</div>` },
      { t: 'Real example 1: forecasting electricity prices', s: '75', deep: [{app: 'sim', id: 'linear-regression', t: 'Linear Regression'}, {app: '4cast'}], h: `
        <div class="cols2"><div><b>Independent</b><ul><li>Natural gas price in € <span class="arrow">→</span> X1</li><li>Daily electricity demand MWh <span class="arrow">→</span> X2</li></ul><b>Dependent variable</b><ul><li>Electricity price € <span class="arrow">→</span> Y</li></ul>
        <p>Historical data. What is the label?` + R('ep1') + ` <span class="reveal-body" id="ep1">→ the electricity price Y</span></p>
        <p>Classification or regression?` + R('ep2') + ` <span class="reveal-body" id="ep2">→ Regression: the price is continuous</span></p></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Natural gas price € (X1)</th><th>Daily demand MWh (X2)</th><th>Current price € (Y)</th></tr></thead><tbody>
        <tr><td>1</td><td>48.73</td><td>156.71</td><td>136.09</td></tr><tr><td>2</td><td>77.54</td><td>128.37</td><td>154.11</td></tr><tr><td>3</td><td>66.60</td><td>137.53</td><td>154.04</td></tr><tr><td>4</td><td>59.93</td><td>141.98</td><td>137.60</td></tr><tr><td>5</td><td>37.80</td><td>147.36</td><td>120.35</td></tr><tr><td>6</td><td>37.80</td><td>167.11</td><td>117.41</td></tr><tr><td>7</td><td>32.90</td><td>131.98</td><td>100.63</td></tr><tr><td>8</td><td>73.31</td><td>150.85</td><td>164.30</td></tr><tr><td>9</td><td>60.06</td><td>155.54</td><td>152.98</td></tr><tr><td>10</td><td>65.40</td><td>122.79</td><td>143.45</td></tr><tr><td>11</td><td>31.03</td><td>156.45</td><td>114.24</td></tr><tr><td>12</td><td>78.50</td><td>130.23</td><td>159.79</td></tr></tbody></table></div></div>` },
      { t: 'Real example 2: activation of a natural gas plant', s: '76', h: `
        <p>If we predict <b>sunshine &lt; 6 hours</b> <span class="arrow">→</span> natural gas plant <b>on!</b> Target <span class="arrow">→</span> sunshine hours.</p>
        <div class="cols2"><div><b>Independent</b><ul><li>Cloud cover % of the day <span class="arrow">→</span> X1</li><li>Humidity % <span class="arrow">→</span> X2</li></ul>
        <b>Dependent variable</b><ul><li>Sunshine hours <span class="arrow">→</span> Y1 <b>continuous</b> <span class="arrow">→</span> <b>regression</b></li><li>Natural gas unit on/off <span class="arrow">→</span> Y2 <b>discrete</b> <span class="arrow">→</span> <b>classification</b></li></ul>
        <div class="key">The same problem can be a regression or a classification: it depends on the target we choose.</div></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Cloud cover (%) X1</th><th>Humidity (%) X2</th><th>Sunshine hours Y1</th><th>Gas unit Y2</th></tr></thead><tbody>
        <tr><td>1</td><td>51</td><td>82</td><td>6.9</td><td>0</td></tr><tr><td>2</td><td>92</td><td>31</td><td>3.1</td><td>1</td></tr><tr><td>3</td><td>14</td><td>59</td><td>11.1</td><td>0</td></tr><tr><td>4</td><td>71</td><td>67</td><td>5.9</td><td>1</td></tr><tr><td>5</td><td>60</td><td>31</td><td>8.7</td><td>0</td></tr><tr><td>6</td><td>20</td><td>93</td><td>10.3</td><td>0</td></tr><tr><td>7</td><td>82</td><td>89</td><td>4.1</td><td>1</td></tr><tr><td>8</td><td>86</td><td>50</td><td>4.1</td><td>1</td></tr><tr><td>9</td><td>74</td><td>62</td><td>5.1</td><td>1</td></tr><tr><td>10</td><td>74</td><td>87</td><td>5.3</td><td>1</td></tr><tr><td>11</td><td>87</td><td>51</td><td>4.4</td><td>1</td></tr></tbody></table></div></div>` },
      { t: 'Supervised learning algorithms', s: '77', h: `
        <p>The supervised learning algorithms of this presentation, each in its own chapter:</p>
        <ul><li><a href="#/p1/6/1">Artificial Neural Networks (ANN)</a></li><li><a href="#/p1/10/1">Support Vector Machines (SVM)</a> and <a href="#/p1/11/1">Support Vector Regression (SVR)</a></li><li><a href="#/p1/7/1">Decision Trees</a></li><li><a href="#/p1/8/1">Random Forests</a></li><li><a href="#/p1/9/1">XGBoost</a></li><li><a href="#/p1/12/1">K Nearest Neighbors</a></li><li><a href="#/p1/13/1">Ensemble methods</a></li></ul>` }
    ],
    quiz: [
      { q: 'In the cat example, what is the dependent variable (Y)?', a: ['The label: cat or not cat', 'The animal photos', 'The number of observations n = 100', 'The name of the pet'], e: 'Photos → independent variable (X). The label of whether the animal is a cat → dependent variable (Y).' },
      { q: 'When do we use the test (hold-out) set?', a: ['After training, once, to classify new observations the model has never seen', 'During training, to show the labels to the model', 'Before training, to choose the variables', 'Never: we only need the training data'], e: 'From the train step we move to the test step: new photos are fed into the model using the test (hold-out) set.' },
      { q: 'In the natural gas plant example, predicting "gas unit on/off" (Y2) is...', a: ['Classification, because Y2 is discrete', 'Regression, because Y2 is continuous', 'Clustering, because there is no label', 'Reinforcement learning'], e: 'Natural gas unit on/off → Y2 discrete → classification. Sunshine hours → Y1 continuous → regression.' },
      { q: 'Forecasting the electricity price from the gas price and the demand is...', a: ['A supervised regression problem', 'A supervised classification problem', 'An unsupervised clustering problem', 'A reinforcement learning problem'], e: 'We have labels (historical prices) and the price is continuous.' }
    ]
  });

  /* ------------------------------------------------------------ 6 */
  ch({
    title: 'Artificial Neural Networks (ANN)', short: 'ANN', slides: '78-128', inter: 'ReLU, gradient descent',
    steps: [
      { t: 'Inspired by the brain', s: '78-80', h: `
        <ul><li>They were developed in the <b>1950s</b> and were believed to mimic the <b>human brain</b> in its structure and function.</li>
        <li>Various stimuli <span class="arrow">→</span> neurons <span class="arrow">→</span> process info <span class="arrow">→</span> signals propagate to next cells.</li>
        <li>In the brain, around <b>4000 nerve fibres</b> connect to a single neuron.</li></ul>` },
      { t: '3 main parts interconnected: the layers', s: '81-84', h: `
        <p>The computational model inspired by the human brain, composed of interconnected processing <b>layers</b>: the <b>input layer</b>, the <b>hidden layer</b> and the <b>output layer</b>.</p>
        <div data-fig="annLayers"></div>
        <h4>The input layer</h4>
        <p>What is the input layer? <span class="arrow">→</span> <b>Our independent variables.</b> We want to predict the electricity price € <span class="arrow">→</span> Y:</p>
        <ul><li>X1 <span class="arrow">→</span> natural gas price €</li><li>X2 <span class="arrow">→</span> electricity demand MWh</li></ul>` },
      { t: 'Why a hidden layer? To allow for non-linearity!', s: '85-88', h: `
        <ul><li>It helps the ANN to <b>capture complex patterns</b> that simple linear relationships cannot express.</li>
        <li><b>Without this</b>, the network can describe-predict <b>only straight (linear)</b> relationships between the variables.</li>
        <li>With a <b>hidden layer</b>, the network can <b>combine</b> and <b>transform</b> input data <b>nonlinearly</b>, allowing it to understand things like <b>curves</b>, <b>categories</b>, or <b>interactions</b> between variables (for example, recognizing groups or nonlinear economic patterns).</li></ul>
        <div class="ex"><b>Example:</b> electricity <b>consumption (kWh)</b> and <b>temperature</b> form a U shape: we use more electricity when it is very cold and when it is very hot. A straight line cannot describe it.</div>` },
      { t: 'Inside the hidden layer: how it works in simple words', s: '89', h: `
        <p>If we have from our <b>input layer</b> (our independent variables) the following:</p>
        <ul><li><b>Price of NG</b> X1 = 2 and <b>Demand</b> X2 = 4</li><li>randomly choose the "<b>weights</b>" <span class="arrow">→</span> e.g. w1 = 0.5 and w2 = 3</li><li>randomly choose a "<b>bias</b>" <span class="arrow">→</span> e.g. b = −5</li></ul>
        <p>With these, we create the linear transformation:</p>
        <div class="tex-block">w_1 x_1 + w_2 x_2 + b = 0.5\\cdot 2 + 3\\cdot 4 - 5 = 1 + 12 - 5 = 8</div>
        <p>Reminds you of something? <span class="tex">\\beta_1 x_1 + \\beta_2 x_2 + c</span>. This result is sent to <b>node n1</b> in the hidden layer.</p>` },
      { t: 'What do we do with this result?', s: '90', h: `
        <ul><li>We use the result in the <b>activation function φ</b>.</li>
        <li>If the activation function is <span class="tex">y = 2x</span> then <span class="tex">\\hat y(8) = 2\\cdot 8 = 16</span> <span class="arrow">→</span> ŷ = 16 is the ANN <b>prediction</b> for the price of electricity the next day!</li>
        <li>If the prediction ŷ = 16 is <b>different</b> from the actual value y, e.g. y = 12, we go back and change the <b>weights and biases</b>.</li>
        <li>This process is called "<b>backpropagation</b>" <span class="arrow">→</span> correcting the error.</li>
        <li>In backpropagation we use the "<b>gradient descent</b>" method to optimize.</li>
        <li>We stop when we reach an <b>acceptable average accuracy</b> over all observations in the sample.</li></ul>` },
      { t: 'The activation function: ReLU', s: '91-92', h: `
        <p>In practice, one of the activation functions φ we use is the</p>
        <div class="key"><b>ReLU</b> <span class="arrow">→</span> <span class="tex">y = \\max(0, x)</span>, <b>Re</b>ctified <b>L</b>inear <b>U</b>nit, aka "hinge function".</div>
        <ul><li>Here, in our example <span class="tex">\\hat y(8) = 8</span> <span class="arrow">→</span> is the ANN <b>prediction</b> for the price of electricity the next day!</li>
        <li>What ReLU does: if x &gt; 0 <span class="arrow">→</span> y = x <span class="arrow">→</span> <b>fires</b> the node as strong as x; if x &lt; 0 <span class="arrow">→</span> y = 0 <span class="arrow">→</span> <b>does not fire</b> the node.</li></ul>
        <h4>How the activation function works</h4>
        <p>The activation function <b>decides</b> whether a neuron "<b>fires</b>" and <b>how strongly</b>, hence introducing <b>nonlinearity</b>. It ensures that the ANN can describe complex relationships and not just linear ones, through:</p>
        <ul><li><b>Elimination of negative values</b> (e.g., ReLU zeroes all negatives)</li><li><b>Output limitation</b> to a range such as 0 to 1 or −1 to 1.</li><li>etc.</li></ul>` },
      { t: 'Example: the A/C and ReLU(x − 20)', s: '93', h: `
        <p>A/C power consumption (y) in € in relation to temperature (x). We know that <span class="tex">y = x - 20</span> for x &gt; 20 and 0 for x ≤ 20. If temperature x = 30 °C <span class="arrow">→</span> consumption <span class="arrow">→</span> y = 30 − 20 = 10 €.</p>
        <p>How are we going to describe this?</p>
        <ul><li>With a linear function <span class="arrow">→</span> y = (x − 20): for temp &gt; 20 it is OK. Does <b>not</b> work well for temp &lt; 20.</li>
        <li>With the <b>ReLU</b> and weight = 1, bias = −20: ReLU <span class="arrow">→</span> <span class="tex">y = \\max(0, x - 20)</span>. <b>Works very well!</b></li></ul>
        <div data-fig="reluAC"></div>` },
      { t: 'Creating complex non-linearity: n1 − n2', s: '94-97', fig: 'reluMix', h: `
        <ul><li>An activation function φ introduces <b>nonlinearity</b> that better fits most phenomena. So far, we have seen simple nonlinearities (the A/C problem).</li>
        <li>To describe and forecast <b>highly nonlinear</b> variables, we can <b>combine several activation functions</b>: we use more nodes in the hidden layer, then we combine linearly the extra nodes, i.e. <span class="tex">y = \\varphi_1 + \\varphi_2</span>.</li></ul>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Component</th><th>HL neuron 1 (n1)</th><th>HL neuron 2 (n2)</th></tr></thead><tbody>
        <tr><td>Input</td><td>x</td><td>x</td></tr><tr><td>Weight, bias</td><td>1, −2</td><td>1, −4</td></tr><tr><td>Activation function</td><td>ReLU(x − 2)</td><td>ReLU(x − 4)</td></tr><tr><td>Output φ</td><td>activates when x &gt; 2</td><td>activates when x &gt; 4</td></tr></tbody></table></div>
        <p>Output = <b>n1 − n2</b> <span class="arrow">→</span> rises at x = 2 and flattens out at x = 4.</p>
        <ul><li><b>Segment 1 (x &lt; 2):</b> both neurons are off <span class="arrow">→</span> output = 0 (flat).</li><li><b>Segment 2 (2 &lt; x &lt; 4):</b> only n1 is on <span class="arrow">→</span> output rises with slope 1.</li><li><b>Segment 3 (x &gt; 4):</b> n2 also turns on; its slope (−1) cancels n1's slope (+1) <span class="arrow">→</span> flat again.</li></ul>
        <p>With 5 ReLU neurons we can approximate a complex function with peaks and valleys.</p>
        <div data-fig="reluMix"></div>` },
      { t: 'An analogy for activation functions', s: '98', h: `
        <div class="key"><b>Analogy:</b> linear functions are like straight <b>steel pieces</b>; activation functions are like <b>hinges</b>. Many hinges turn straight pieces into a flexible <b>bicycle chain</b> that can wrap around any shape.</div>
        <p><b>Universal approximator:</b> with enough "bends", a neural network can mimic <b>any continuous function</b>.</p>` },
      { t: 'Activation functions: what they do to y', s: '99', fig: 'activations', h: `
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Function</th><th>Formula</th><th>What it does to y</th></tr></thead><tbody>
        <tr><td>Sigmoid</td><td><span class="tex">\\sigma(x)=\\frac{1}{1+e^{-x}}</span></td><td>Constrains to [0, 1]</td></tr>
        <tr><td>tanh</td><td><span class="tex">\\tanh(x)</span></td><td>Constrains to [−1, 1], centered at 0</td></tr>
        <tr><td>ReLU</td><td><span class="tex">\\max(0, x)</span></td><td>Eliminates negative values</td></tr>
        <tr><td>Leaky ReLU</td><td><span class="tex">\\max(0.1x, x)</span></td><td>Weakens negative values</td></tr>
        <tr><td>Maxout</td><td><span class="tex">\\max(w_1^T x + b_1, w_2^T x + b_2)</span></td><td>Picks the best of several lines</td></tr>
        <tr><td>ELU</td><td><span class="tex">x</span> if x ≥ 0, <span class="tex">\\alpha(e^x - 1)</span> if x &lt; 0</td><td>Limits negative values to −α</td></tr></tbody></table></div>
        <div data-fig="activations"></div>` },
      { t: 'Backpropagation and gradient descent', s: '100-102', deep: [{app: 'sim', id: 'gradient-descent', t: 'Gradient Descent'}], h: `
        <p>Mathematical transformations in ANNs: each input is multiplied by a <b>weight</b> and they are added together with a <b>bias</b> (linear transformation), then the <b>activation function</b> makes the nonlinear transformation. The weights and biases are chosen <b>randomly</b> at first.</p>
        <h4>Backpropagation procedure <span class="arrow">→</span> correcting the forecast</h4>
        <ul><li>We <b>change the weights</b> a bit and see if the forecast gets better.</li><li><b>Hot – Cold</b> like procedure.</li><li><b>Repeat</b> as necessary to achieve a preset <b>max error</b>, e.g. 1%.</li></ul>
        <h4>Gradient descent</h4>
        <ul><li><b>Mathematically</b> we take the <b>derivative</b> of the <b>error</b> with respect to each parameter θ, i.e. how the error changes as we change θ.</li>
        <li>If the derivative is <b>positive</b> (θ↑ → e↑) <span class="arrow">→</span> <b>decrease</b> θ.</li><li>If the derivative is <b>negative</b> (θ↑ → e↓) <span class="arrow">→</span> <b>increase</b> θ.</li>
        <li><b>Stop</b> when we reach a <b>minimum</b>. Graphically we find the minimum of the error (or loss function).</li></ul>` },
      { t: 'Local and global minima', s: '103-106', deep: [{app: 'sim', id: 'gradient-descent', t: 'Gradient Descent'}], fig: 'gradDescent', h: `
        <ul><li>Must avoid <b>local minima</b> <span class="arrow">→</span> find the <b>global minimum</b>.</li>
        <li><b>Step size</b> (learning rate) for θ is important to avoid local minima. E.g. correct the weight from:
          <ul><li>2 <span class="arrow">→</span> 3: local minimum, trapped in that area, vs</li><li>2 <span class="arrow">→</span> 6: global minimum, optimum search.</li></ul></li></ul>
        <h4>Many parameters θi</h4>
        <p>Backpropagation in 3D <span class="arrow">→</span> adjusting <b>2 weights</b> simultaneously: the loss is a surface over (w1, w2) and we navigate down to the global minimum. In the actual case the surface has many hills and valleys: we need a <b>dense search</b> for the global minimum <span class="arrow">→</span> training time ↑.</p>
        <div class="key">We change the parameters <span class="arrow">→</span> <b>weights and biases</b> to <b>minimize the error</b>.</div>
        <div data-fig="gradDescent"></div>` },
      { t: 'In general: finding the function from the data', s: '107-108', h: `
        <p>If we have the function that connects x and y, we can predict.</p>
        <div class="ex"><b>Example:</b> temperature and power consumption in A/C. Independent variable (x): the outside temperature. Dependent variable (y): consumption in kWh. We know that <span class="tex">y = 0.5x - 5</span>. If the temperature is 40 °C: y = (0.5·40) − 5 = 20 − 5 = <b>15 kWh</b>.</div>
        <p><b>Usually, however</b>, instead of the function we have the <b>data</b> x and y and we try with our models to <b>find the function</b>. An ANN tries during training to simulate the real function (the data generating mechanism) that produces the data.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead><tbody>
        <tr><td>Temperature (°C)</td><td>28</td><td>30</td><td>32</td><td>35</td><td>38</td><td>40</td><td>42</td><td>37</td><td>34</td><td>31</td></tr>
        <tr><td>Consumption (kWh)</td><td>4.8</td><td>6.1</td><td>7.2</td><td>9.0</td><td>10.8</td><td>12.5</td><td>14.2</td><td>10.1</td><td>8.5</td><td>6.6</td></tr></tbody></table></div>` },
      { t: 'Real application: handwritten numbers', s: '110-112', h: `
        <ul><li><b>Problem:</b> character recognition <span class="arrow">→</span> handwriting. Easy for humans, not so simple for the computer. Sometimes not easy even for a human!</li>
        <li><b>Input layer <span class="arrow">→</span> data:</b> every <b>pixel</b> is an independent variable in the input layer <span class="arrow">→</span> 0 (no ink) or 1 (ink).</li>
        <li><b>20 × 30 pixels = 600</b> input layer nodes.</li>
        <li><b>Output layer:</b> one node for each digit 0 to 9. The neurons fire in real time and the strongest output node is the prediction.</li></ul>` },
      { t: 'Deep learning: size does matter', s: '113-117', h: `
        <p>If in the ANN we add <b>more hidden layers</b>, the output from hidden layer HL1 propagates to the next hidden layer HL2 with new weights and biases and then to HL3, etc. This is called <b>Deep Learning</b>.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Commercial application</th><th>Hidden layers</th></tr></thead><tbody><tr><td>Google</td><td>3-4</td></tr><tr><td>Netflix</td><td>1-3</td></tr><tr><td>Tesla</td><td>50-100</td></tr><tr><td>ChatGPT</td><td>100+</td></tr></tbody></table></div>
        <h4>Applications</h4>
        <ul><li><b>Self driving cars</b></li><li><b>Voice recognition</b> and digital assistants <span class="arrow">→</span> Alexa, Siri, Google Assistant</li><li><b>Recommendation systems</b>: Netflix, YouTube, Spotify</li>
        <li><b>Generative AI <span class="arrow">→</span> LLMs</b> <span class="arrow">→</span> ChatGPT, Copilot, Gemini, Grok, Perplexity. They use <b>huge</b> neural networks, called <b>Transformers</b>, that have "read" almost all the available text on the internet, allowing them to predict which word should follow the previous one to make sense. <i>Fun fact: Transformers were invented in 2017 for translation!</i></li></ul>
        <div class="key"><b>Summary:</b> in the A/C example we used a simple "function" <span class="arrow">→</span> ReLU. Deep learning uses <b>millions</b> of such small functions linked together to solve problems that are much more complex than a simple table of data.</div>` },
      { t: 'Disadvantages of ANN: it is a black box', s: '118-121', deep: [{app: 'sim', id: 'linear-regression', t: 'Linear Regression'}], h: `
        <p>We know what's happening, the outcome, the prediction. But we <b>don't know why</b> we have this result.</p>
        <div class="cols2"><div class="mapcol"><h5>1. Econometrics</h5><ul><li>Focuses on the <b>relationships</b> between the variables <span class="arrow">→</span> the βs.</li><li>Interpretation of phenomena is important as models are <b>interpretable</b>.</li><li>Xs have a <b>constant effect</b> on Y, the βs <span class="arrow">→</span> strictly monotonic relationship.</li><li>An increase in X will always have the same effect on Y: here <span class="tex">f'(x) &gt; 0</span>, 0.5 in the example y = 0.5x − 5.</li></ul></div>
        <div class="mapcol"><h5>2. Machine Learning</h5><ul><li>Focuses on <b>prediction</b>.</li><li>No or little interpretability.</li><li>Thus, known as <b>black box</b> algorithms.</li><li>Xs may <b>not</b> have a constant effect on Y.</li><li><b>Non-strictly monotonic</b> relationship.</li></ul></div></div>
        <h4>Monotonicity in X and Y (derivative of y with respect to x)</h4>
        <ul><li><b>Positive monotonic or non-decreasing</b> <span class="tex">f'(x)\\ge 0</span>: when the value of one variable increases, the value of the other tends to increase as well or remain constant.</li>
        <li><b>Negative monotonic or non-increasing</b> <span class="tex">f'(x)\\le 0</span>: when the value of one variable increases, the value of the other tends to decrease or remain constant.</li>
        <li>We can even have a <b>non-monotonic</b> relationship: as X increases, Y may increase for a certain interval and then decrease for another (or vice versa).</li></ul>` },
      { t: 'Why black box? Opening it with XAI', s: '124-127', h: `
        <ul><li>Complex and extraordinary <b>nonlinear functional forms</b>. How much does a change in a weight W affect the loss L? Very difficult to see: non-linear, the effect is not constant. Like the Standard Model Lagrangian from quantum field theory.</li>
        <li>A tiny network with 2 inputs, 3 ReLU neurons and 1 output already has <b>13 parameters</b> (6 weights, 3 biases, 3 output weights, 1 bias). Imagine with <b>billions</b>, i.e. ChatGPT, Claude.</li></ul>
        <h4>Explainable AI <span class="arrow">→</span> XAI</h4>
        <p>That's why we need some form of <b>explainability</b>: Data <span class="arrow">→</span> Model <span class="arrow">→</span> Interpretability methods <span class="arrow">→</span> Humans. Transparency is necessary in many cases:</p>
        <ul><li>Loans <span class="arrow">→</span> why rejection?</li><li>Power theft detection <span class="arrow">→</span> where do we base it?</li><li>Promotions <span class="arrow">→</span> who is promoted and why?</li><li>Hiring employees <span class="arrow">→</span> Google with AI <span class="arrow">→</span> case study</li><li>etc.</li></ul>
        <p>XAI matters for trust and safety, compliance, model debugging and human-in-the-loop decisions.</p>` },
      { t: 'Other disadvantages of ANN', s: '128', deep: [{app: 'sim', id: 'polynomial-overfitting', t: 'Polynomial Overfitting'}, {app: 'sim', id: 'regularization', t: 'Regularization'}], h: `
        <p>We need <b>a lot of</b>:</p>
        <div class="cols3"><div class="mapcol"><h5>Data</h5>Requires vast amounts of labeled training data to prevent overfitting and achieve accuracy.</div><div class="mapcol"><h5>Time</h5>Training can take days, weeks, or even months for complex architectures and massive datasets.</div><div class="mapcol"><h5>Processing power</h5>Demands specialized hardware like GPUs, TPUs, and extensive compute resources to run successfully.</div></div>` }
    ],
    quiz: [
      { q: 'With X1 = 2, X2 = 4, weights w1 = 0.5, w2 = 3 and bias b = −5, what does node n1 receive?', a: ['8', '14', '16', '3'], e: '0.5·2 + 3·4 − 5 = 1 + 12 − 5 = 8.' },
      { q: 'What does ReLU do to a negative input?', a: ['It returns 0: the node does not fire', 'It returns the input unchanged', 'It squeezes it between 0 and 1', 'It multiplies it by 2'], e: 'ReLU: y = max(0, x). If x < 0 → y = 0 → does not fire the node.' },
      { q: 'Why do we need a hidden layer with an activation function?', a: ['To allow for non-linearity', 'To store the labels', 'To make training faster', 'To remove the bias'], e: 'Without it, the network can describe only straight (linear) relationships.' },
      { q: 'In gradient descent, the derivative of the error with respect to θ is positive. What do we do?', a: ['Decrease θ', 'Increase θ', 'Stop training', 'Add a hidden layer'], e: 'Derivative positive (θ↑ → e↑) → decrease θ.' },
      { q: 'Why is an ANN called a "black box"?', a: ['We get the prediction but we don\'t know why we have this result', 'It cannot make predictions', 'It only works with images', 'Its weights are never changed'], e: 'Complex nonlinear functional forms: the effect of a variable is not constant. That is why we need XAI.' }
    ]
  });

  /* ------------------------------------------------------------ 7 */
  ch({
    title: 'Decision trees', short: 'Decision trees', slides: '130-144', inter: 'Decision tree',
    steps: [
      { t: 'Decision in steps', s: '130-131', h: `
        <ul><li><b>Easy</b> to understand.</li><li>We use <b>similar logic</b> every day.</li><li>Will I accept a <b>job</b>? A decision-making process:</li></ul>
        <div data-fig="jobTree"></div>
        <p>The first question is the <b>root node</b>, the next questions are <b>decision nodes</b> and the final answers are the <b>leaf nodes</b>.</p>` },
      { t: 'Automatic detection: electricity theft', s: '132-133', h: `
        <ol><li>First indication of a large drop in consumption Y/N</li><li>If N <span class="arrow">→</span> Legit</li><li>If Y, broken seal Y/N</li><li>If Y <span class="arrow">→</span> Theft</li><li>If N <span class="arrow">→</span> we are looking for more sophisticated methods of power theft <span class="arrow">→</span> bypass</li><li>If N <span class="arrow">→</span> Legit</li><li>If Y <span class="arrow">→</span> Theft</li></ol>
        <div data-fig="theftTree"></div>
        <div class="ex"><b>Other applications: medicine.</b> Patient triage and screening workflow: a clinical decision algorithm for evaluating patients with potential viral symptoms (are virus-related symptoms present? is the temperature above 38 °C? <span class="arrow">→</span> hospitalize the patient or symptomatic treatment at home quarantine).</div>` },
      { t: 'Fruit sorting system for packaging', s: '134-135', h: `
        <p>Classification or regression?` + R('fr1') + ` <span class="reveal-body" id="fr1">→ Classification: the tag (Apple, Pear, Banana, Grape) is discrete.</span></p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tag</th><th>Color</th><th>Diameter</th><th>Height</th></tr></thead><tbody>
        <tr><td>Apple</td><td>Red</td><td>3</td><td>5</td></tr><tr><td>Apple</td><td>Yellow</td><td>3</td><td>4</td></tr><tr><td><b>Apple</b></td><td><b>Green</b></td><td><b>3</b></td><td><b>4</b></td></tr><tr><td><b>Pear</b></td><td><b>Green</b></td><td><b>3</b></td><td><b>4</b></td></tr><tr><td>Banana</td><td>Yellow</td><td>2</td><td>6</td></tr><tr><td>Grape</td><td>Red</td><td>1</td><td>1</td></tr><tr><td>Grape</td><td>Green</td><td>1</td><td>1</td></tr></tbody></table></div>
        <div class="key"><b>Indistinguishable:</b> the green apple and the pear have identical features (Green, 3, 4). No question can separate them.</div>` },
      { t: 'How do we choose the question? The Gini impurity', s: '136-138', h: `
        <p>Let's start with a question, for example: <b>"Is the diameter ≥ 3?"</b> True: Apple R, Apple G, Apple Y, Pear G. False: Banana, Grape G, Grape R.</p>
        <p><b>But</b> <span class="arrow">→</span> how do we choose the question (how do we choose the initial split)?</p>
        <ul><li>We ask <b>every possible separation question</b> and calculate the <b>Gini Impurity Index</b>.</li><li>The Gini Impurity Index is a measure that tells us how "<b>messy</b>" our data are.</li><li>Thus, we choose the question that <b>minimizes</b> the Gini Impurity Index.</li></ul>
        <div class="tex-block">I_G(p) = 1 - \\sum_{i=1}^{J} p_i^2</div>
        <p><b>How it works.</b> Imagine you have a box of balls:</p>
        <ul><li><b>Absolute purity (Gini = 0):</b> all the balls in the box are red. If you close your eyes and pick one, you know for sure what color it will be. There is no "impurity" at all.</li>
        <li><b>Maximum impurity (Gini = 0.5):</b> the box has 50% red and 50% blue balls. This is where there is maximum "confusion", because it is completely uncertain what color you will draw.</li>
        <li><b>In binary classification (2 categories)</b>, e.g. Up/Down, Spam/Not Spam, the maximum value is 0.5. With k classes the maximum is 1 − 1/k (our 4 fruits <span class="arrow">→</span> 0.75).</li></ul>
        <div class="ex"><b>In our example:</b> 3 apples, 1 pear, 1 banana, 2 grapes out of 7: <span class="tex">1 - \\left(\\tfrac{9}{49}+\\tfrac{1}{49}+\\tfrac{1}{49}+\\tfrac{4}{49}\\right) = 0.694</span>.</div>` },
      { t: 'Grow the tree, question by question', s: '139-144', fig: 'dtree', h: `
        <p>Start: Gini impurity = 0.694. <b>Example with ≥ 3:</b> after the split the Gini impurity is 0.405 (decrease = 0.289). <b>Example with ≤ 1:</b> 0.400 (decrease = 0.294) <span class="arrow">→</span> so we choose this question. The grapes form the <b>1st leaf</b>.</p>
        <p><b>Leaf node (or terminal node)</b> <span class="arrow">→</span> is a final node in the tree <span class="arrow">→</span> no further separation. Then the next level: "Is the diameter ≤ 2?" (0.400 <span class="arrow">→</span> 0.214) and "Is the fruit green?" (0.214 <span class="arrow">→</span> 0.143). Further separation is not possible.</p>
        <p>Try it: select a group, look at <b>every possible question</b> and its Gini, and grow the tree to its final form.</p>
        <div data-fig="dtree"></div>` }
    ],
    quiz: [
      { q: 'A box has 50% red and 50% blue balls. What is its Gini impurity?', a: ['0.5', '0', '1', '0.25'], e: '1 − (0.5² + 0.5²) = 0.5: maximum impurity for 2 categories.' },
      { q: 'Which question does the tree choose at each node?', a: ['The one that minimizes the Gini impurity', 'The one that maximizes the Gini impurity', 'The first question we think of', 'A random question'], e: 'We ask every possible separation question and choose the one that minimizes the Gini Impurity Index.' },
      { q: 'With the 4 kinds of fruit, what is the maximum possible Gini impurity?', a: ['0.75', '0.5', '0.694', '1'], e: 'With k classes the maximum is 1 − 1/k = 1 − 1/4 = 0.75.' },
      { q: 'Why can the tree not separate the green apple from the pear?', a: ['They have identical features (Green, diameter 3, height 4)', 'The Gini impurity is already 0', 'The tree has too many leaves', 'Pears are not in the data'], e: 'Indistinguishable: identical features, so further separation is not possible.' },
      { q: 'What is a leaf (terminal) node?', a: ['A final node in the tree: no further separation', 'The first question of the tree', 'A node with the highest Gini', 'A node that asks about colour'], e: 'Leaf node (or terminal node) → is a final node → no further separation.' }
    ]
  });

  /* ------------------------------------------------------------ 8 */
  ch({
    title: 'Random forests: bagging trees', short: 'Random forests', slides: '145-152', inter: 'Forest vote',
    steps: [
      { t: 'From decision trees to random forests', s: '145-146', deep: [{app: 'sim', id: 'polynomial-overfitting', t: 'Polynomial Overfitting'}, {app: 'sim', id: 'bias-variance', t: 'Bias-Variance Tradeoff'}], h: `
        <p>Decision trees are simple in: <b>construction</b>, <b>use</b>, <b>interpretation</b>.</p>
        <p>But in practice:</p>
        <ul><li>They tend to <b>overfit</b>:</li><li>They work well with <b>training data</b>,</li><li>But they don't perform well on <b>new data</b>.</li></ul>
        <div class="key">A very powerful algorithm based on decision trees is <b>Random Forests</b>.</div>` },
      { t: 'Creating the random forest: bootstrapping', s: '147-148', fig: 'forest', h: `
        <ol><li>Suppose our initial sample has size <b>n</b>.</li><li>We create a new sample, of size n, using the <b>bootstrapping</b> technique.</li></ol>
        <div class="key"><b>Bootstrapping</b> is the sampling with replacement<br><span class="arrow">→</span> It is allowed to select the same observation <b>more than once</b>.<br><span class="arrow">→</span> Some observations will <b>not be selected at all</b>.</div>
        <div class="ex"><b>Example:</b> initial sample of size 5 (A, B, C, D, E). Create 3 new samples of size 5, each with random selection with replacement. A sample can contain C twice and miss B.</div>
        <div data-fig="forest"></div>` },
      { t: 'Creating the random forest: many trees', s: '149', h: `
        <ol start="3"><li>From the initial <b>j</b> variables we <b>randomly</b> choose <b>k</b> <span class="arrow">→</span> usually <span class="tex">k = \\sqrt{j}</span>, e.g. from 9 we choose 3.</li>
        <li>We create a <b>decision tree</b> as we saw before with:<ul><li>the <b>bootstrapped</b> sample data from step 2,</li><li>the <b>k</b> variables from step 3.</li></ul></li>
        <li>We return to step 1 and create another 10, 50, 100, 1000 trees.</li></ol>` },
      { t: 'Random forests decide democratically: by voting!', s: '150-151', fig: 'forestVote', h: `
        <ul><li>Each of the trees we created <b>votes</b>.</li><li>Final decision, prediction <span class="arrow">→</span> the <b>majority</b>.</li></ul>
        <p>For any new data to be forecasted, we run through <b>each tree</b> and record the decision:</p>
        <ul><li>"increase in stock price" or "decrease in stock price"</li><li>"power theft" or "no power theft" for the customer</li><li>"re-admission" or "no re-admission"</li><li>"legitimate" or "fraudulent" credit card transaction</li></ul>
        <p>They also work with <b>continuous variables</b>: forecasting the price of a stock or index, bond returns, natural gas price, etc. (the trees' forecasts are averaged).</p>
        <div class="key">This technique that uses <b>B</b>ootstrapping + <b>Agg</b>regat<b>ing</b> is called <b>BAGGING</b>.</div>
        <div data-fig="forestVote"></div>` },
      { t: 'Real example: electricity demand', s: '152', h: `
        <p>A real example of an hourly <b>kWh electricity demand</b> forecast over one week (168 hours). The random forest forecast closely follows the actual demand, with its daily peaks and valleys.</p>` }
    ],
    quiz: [
      { q: 'What is bootstrapping?', a: ['Sampling with replacement: an observation can be selected more than once', 'Sampling without replacement', 'Choosing the best variables', 'Adding a hidden layer'], e: 'Bootstrapping is the sampling with replacement; some observations will not be selected at all.' },
      { q: 'With j = 16 variables, how many does each tree usually get to choose from?', a: ['4', '16', '8', '2'], e: 'Usually k = √j = √16 = 4.' },
      { q: 'How does a random forest classify a new observation?', a: ['Each tree votes and the majority wins', 'Only the first tree decides', 'It uses the tree with the lowest Gini', 'It averages the Gini impurities'], e: 'Random forests decide democratically → by voting!' },
      { q: 'Why do we build random forests instead of one decision tree?', a: ['One tree tends to overfit: it works well on training data but not on new data', 'One tree cannot do classification', 'Trees cannot use more than 2 variables', 'Random forests need no data'], e: 'Decision trees tend to overfit; many trees on bootstrapped samples vote.' }
    ]
  });

  /* ------------------------------------------------------------ 9 */
  ch({
    title: 'XGBoost: Extreme Gradient Boosting', short: 'XGBoost', slides: '153-158', inter: 'Boosting',
    steps: [
      { t: 'What is it?', s: '153-154', h: `
        <ul><li><b>XGBoost</b> (Extreme Gradient Boosting) is essentially a "<b>booster</b>" of decision trees.</li><li>It is an <b>evolution</b> of decision trees.</li><li>Works with the logic of <b>collective learning</b> (aka <b>ensemble learning</b>).</li><li>Like <b>random forests</b>, which also belong to ensemble learning models.</li></ul>` },
      { t: 'Comparison with random forests', s: '155', h: `
        <ul><li><b>Random forest</b> <span class="arrow">→</span> many trees are trained in <b>parallel</b> and <b>independently</b>.</li>
        <li><b>XGBoost</b> <span class="arrow">→</span> trees are built <b>sequentially</b>.
          <ol><li>The <b>first tree</b> makes an initial prediction.</li><li>The <b>second tree</b> does not try to predict the final result, but the <b>error</b> (residual) of the first tree.<br><i>Example: if the first prediction was 10 and the actual value was 14, the error is 4 and the second tree tries to predict 4 and adds this value to the prediction of tree 1.</i></li><li>The <b>third tree</b> tries to correct the <b>remaining error</b> of the two previous ones, and so on.</li></ol></li></ul>
        <div class="ex">Imagine it like a <b>student</b> writing an <b>exam</b>: after she finishes, she looks at her mistakes, focuses only on them to correct them, and repeats the process until she reaches the <b>best possible result</b>.</div>` },
      { t: 'The algorithm', s: '156', fig: 'xgboost', h: `
        <ol><li><b>Initialization:</b> we start with a simple prediction (e.g. <b>0.5</b> for all observations).</li>
        <li><b>Gradient calculation:</b> for each observation, we calculate the gradient (slope) of the loss function: how wrong the prediction is at that point.</li>
        <li><b>Training a new tree:</b> we build a tree that predicts these gradients.</li>
        <li><b>Add to set:</b> we add the new tree to the previous model, but with a small "<b>learning rate</b>" η, so that we do not blindly trust every new tree.</li>
        <li><b>Iteration:</b> we continue until the error no longer decreases.</li></ol>
        <div data-fig="xgboost"></div>` },
      { t: 'XGBoost advantages', s: '157-158', h: `
        <ol><li><b>Performance:</b> it is one of the most efficient algorithms. It is almost always the winner in competitions for structured data (tables).</li>
        <li><b>Flexibility:</b> works for regression, classification, and even ranking.</li>
        <li><b>Feature importance:</b> provides ready-made diagrams for which variables (features) influence the prediction the most <span class="arrow">→</span> are most important.</li></ol>
        <div class="ex"><b>Forecasting US GDP:</b> the top-15 independent variables by XGBoost importance, from our paper "Machine learning forecasting in the macroeconomic environment: the case of the US output gap" (Sofianos, Alexakis, Gogas, Papadimitriou, <i>Economic Change and Restructuring</i>). Most of the top variables are lags of industrial production.</div>` }
    ],
    quiz: [
      { q: 'How are the trees of XGBoost built?', a: ['Sequentially: each tree corrects the error of the previous ones', 'In parallel and independently', 'All at once from the same sample', 'Randomly, with no relation to each other'], e: 'Random forest → parallel and independent. XGBoost → sequential.' },
      { q: 'The first tree predicts 10 and the actual value is 14. What does the second tree try to predict?', a: ['4', '14', '10', '24'], e: 'The error (residual) is 14 − 10 = 4; tree 2 predicts 4 and adds it to tree 1.' },
      { q: 'Why does XGBoost add each new tree with a small learning rate η?', a: ['So that we do not blindly trust every new tree', 'To make the trees deeper', 'To remove variables', 'To start at 0.5'], e: 'Add to set with a small learning rate, so that we do not blindly trust every new tree.' }
    ]
  });

  /* ------------------------------------------------------------ 10 */
  ch({
    title: 'Support Vector Machines (SVM) and the kernel trick', short: 'SVM', slides: '159-179, 186', inter: 'SVM, kernel trick',
    steps: [
      { t: 'SVM applications', s: '159-161', h: `
        <p>SVMs are used for <b>classification problems</b>: a discrete dependent variable, binary or multi-class classification. Examples of classification problems:</p>
        <ul><li><b>Up</b> - <b>down</b> of an asset's price</li><li><b>Growth</b> – <b>recession</b> in the economy</li><li><b>Healthy</b> – <b>bankrupt</b> firm</li><li><b>Legitimate</b> – <b>fraudulent</b> card transaction</li><li><b>Approval</b> – <b>rejection</b> of a loan</li><li><b>Re-admission</b> – <b>no readmission</b> to hospital</li></ul>
        <p>We want to create a <b>model</b> that distinguishes/separates the data in the classes <span class="arrow">→</span> need to create a <b>separator</b>.</p>` },
      { t: 'Find the "best" separator', s: '162-165', fig: 'svm', h: `
        <ul><li>Find the "best" <b>separator</b> for the <b>2 classes</b>.</li><li>There is an <b>infinite</b> number of lines <span class="arrow">→</span> try one random! 3 new <b>unknown</b> observations are <b>misclassified</b>.</li>
        <li>Idea! <span class="arrow">→</span> let's choose the one with the <b>maximum distance</b> from the <b>edges</b> of the classes. Now the classification is <b>correct</b>! Even with the <b>unknown data</b>!</li></ul>
        <div class="key"><b>SVM algorithm:</b><br>Finds the observations at the <b>edges</b> of the data (aka <b>support vectors</b>).<br>Fits the line that <b>maximizes</b> the distance from the edges/classes.</div>
        <ul><li>For <b>n</b> dimensions = independent variables, the separator is a <b>hyperplane</b> with <b>n − 1</b> dimensions.</li><li>Looks easy in <b>2 dimensions</b> but imagine in 20...!</li></ul>
        <div data-fig="svm"></div>` },
      { t: 'The kernel trick: the bad news', s: '166-170', deep: [{app: 'sim', id: 'cross-validation', t: 'Cross-Validation'}], h: `
        <ul><li>When the data are like this (UP and DOWN well apart), it's <b>easy</b> to find a separator.</li>
        <li>But when this is the case (the classes mix), it is <b>impossible</b> to have a <b>perfect</b> separation.<br><b>Solution</b> <span class="arrow">→</span> we introduce the parameter <b>c</b> <span class="arrow">→</span> c defines the <b>error tolerance</b>. c is a <b>hyperparameter</b>: we tune it.</li>
        <li><b>Perfect</b> separation <b>never occurs</b> in real data. Real example <span class="arrow">→</span> credit cards: legitimate or fraudulent transactions.</li>
        <li>Another real case: appreciation or depreciation of the FX rate. Even if we allow for <b>some</b> errors, with c, the model has <b>very low accuracy</b>. How can we <b>overcome this problem</b>? We use the <b>"kernel trick"</b>.</li></ul>` },
      { t: 'The kernel trick: more dimensions', s: '171-175', h: `
        <ul><li>We <b>project</b> the data from <b>n</b> to <b>n + i</b> dimensions, i = 1, 2, 3,...<br>From <b>data space</b> <span class="arrow">→</span> in n dimensions. To <b>feature space</b> <span class="arrow">→</span> in n + i dimensions.</li>
        <li>In the <b>feature space</b>, the data can be perfectly <b>linearly separable</b> or the accuracy <b>increases significantly</b>. From 2 to 3 dimensions, a <b>2-dimensional hyperplane</b> can perfectly separate the data into the two classes.</li>
        <li><b>Another example:</b> one class forms a ring around the other. With <span class="tex">\\phi(x_1, x_2) = (x_1, x_2, x_1^2 + x_2^2)</span> the inner class stays low and the ring goes up: a flat plane separates them.</li></ul>
        <h4>Where do these dimensions come from?</h4>
        <ul><li>We <b>create</b> them from the <b>data</b> we already have! Examples of new dimensions: <span class="tex">x_1 x_2,\\; x_1^2,\\; x_1 + x_2^3</span>, etc.</li><li>In practice, there are <b>specific functions (kernels)</b> that do this properly and in an orderly manner. The most popular kernels: <b>linear</b>, <b>RBF</b>, <b>polynomial</b>, <b>sigmoid</b>.</li>
        <li>Finally, we use the kernel's <b>inverse function</b> to project the separator from the <b>feature space</b> to the <b>data space</b>, our original data.</li></ul>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kernel</th><th>Description</th></tr></thead><tbody><tr><td>Linear</td><td>The simplest kernel, calculates the inner product of vectors. Suitable for linearly separable data.</td></tr><tr><td>Polynomial</td><td>It extends features to higher dimensions using polynomials. It helps with nonlinear problems.</td></tr><tr><td>Radial Basis Function (RBF)</td><td>Based on a Gaussian function, handles complex nonlinear boundaries. Widely used due to flexibility.</td></tr><tr><td>Sigmoid</td><td>Similar to neural networks, uses hyperbolic tangent. Useful in some neural models.</td></tr></tbody></table></div>` },
      { t: 'Polynomial kernel: the bank debt-to-equity example', s: '176-179', fig: 'kernel', h: `
        <p><b>Polynomial kernel SVM in 1 dimension.</b> Debt to equity for a bank: 1. <b>high</b> <span class="arrow">→</span> risk <span class="arrow">→</span> bad; 2. <b>low</b> <span class="arrow">→</span> cannot get financing <span class="arrow">→</span> bad. The good banks are in the middle. When a line (a single cut point) is not enough, we add <span class="tex">x^2</span> as a second dimension: the bad banks at both ends go up and a straight line separates them from the good ones.</p>
        <p><b>Polynomial kernel in 2 dimensions:</b> the same idea lifts a plane into a curved surface (a bowl) and a flat plane cuts it.</p>
        <p><b>Actual separator in variable space:</b> projected back, the separator is a closed curved boundary around the class.</p>
        <div data-fig="kernel"></div>` },
      { t: 'Disadvantages of SVM', s: '186', h: `
        <div class="cols3"><div class="mapcol"><h5>Needs lots of data</h5></div><div class="mapcol"><h5>Takes time to train</h5></div><div class="mapcol"><h5>Affected by noise</h5></div></div>` }
    ],
    quiz: [
      { q: 'Which separator does the SVM choose?', a: ['The one with the maximum distance from the edges of the classes', 'The first line that separates the classes', 'The line through the averages of the classes', 'A random line'], e: 'SVM finds the support vectors at the edges and fits the line that maximizes the distance from them.' },
      { q: 'With 3 independent variables, the SVM separator is...', a: ['A plane: a hyperplane with 2 dimensions', 'A line', 'A point', 'A 3-dimensional hyperplane'], e: 'For n dimensions the separator is a hyperplane with n − 1 dimensions.' },
      { q: 'What does the parameter c control?', a: ['The error tolerance: how many misclassifications we accept', 'The number of dimensions', 'The number of trees', 'The learning rate of the ANN'], e: 'c defines the error tolerance; it is a hyperparameter we tune.' },
      { q: 'What does the kernel trick do?', a: ['Projects the data from n to n + i dimensions where they can be separated', 'Removes the noisy observations', 'Reduces the data to 1 dimension', 'Adds labels to the data'], e: 'From data space (n dimensions) to feature space (n + i dimensions).' },
      { q: 'For bank debt-to-equity, both very high and very low values are bad. Why is one cut point not enough?', a: ['The bad banks are on both sides of the good ones', 'There are too many banks', 'Debt-to-equity is a discrete variable', 'The data have no labels'], e: 'A single cut separates only one side; adding x² as a dimension makes a line enough.' }
    ]
  });

  /* ------------------------------------------------------------ 11 */
  ch({
    title: 'Support Vector Regression (SVR)', short: 'SVR', slides: '180-185', inter: 'SVR band',
    steps: [
      { t: 'Regression with machine learning', s: '180-182', h: `
        <p>SVR applications: <b>regression</b>, a <b>continuous</b> dependent variable, predicting the <b>value</b> of the variable.</p>
        <ul><li>In a simple <b>regression model</b>, we find the line that best "<b>describes</b>" our data.</li><li>It is the line where the <b>sum of the squares of the distances</b> from our data is <b>minimized</b>.</li><li>It simply means <span class="arrow">→</span> it is as close as possible to all points.</li></ul>` },
      { t: 'The error tolerance band', s: '183-184', fig: 'svr', h: `
        <ul><li><b>In SVR</b> <span class="arrow">→</span> instead of fitting a line to all data, we define an <b>error tolerance band</b>: the errors in the band are set <b>to zero</b>.</li><li><b>Logic</b> <span class="arrow">→</span> too close = make no difference.</li><li>Only observations <b>outside</b> of the band count.</li><li>It gives us more <b>flexibility</b> than placing a simple line.</li></ul>
        <div class="key">The <b>location</b> and <b>size</b> of the zone are defined by a set of observations called <b>support vectors</b>. Training finds the line position; ε <span class="arrow">→</span> the width of the band (from −ε to +ε) is a hyperparameter we tune.</div>
        <div data-fig="svr"></div>` },
      { t: 'SVR with the kernel trick', s: '185', h: `
        <ul><li>We use a <b>linear</b> function but <span class="arrow">→</span> real phenomena are usually <b>nonlinear</b> as we know!</li><li>So <span class="arrow">→</span> project to <b>more dimensions</b> <span class="arrow">→</span> <b>kernel trick</b>.</li>
        <li>We project into a higher-dimensional space where a <b>linear error tolerance zone</b> is defined and produces good results (a cylinder in 3D).</li><li>Use the <b>inverse kernel function</b> to reproject to the original space and obtain a <b>nonlinear error tolerance band</b> (a curved zone in 2D).</li></ul>` }
    ],
    quiz: [
      { q: 'In SVR, what happens to the errors of observations inside the band?', a: ['They are set to zero', 'They are squared', 'They are doubled', 'They decide the slope alone'], e: 'The errors in the band are set to zero: too close = make no difference.' },
      { q: 'What defines the location and size of the SVR band?', a: ['The support vectors', 'All observations equally', 'The average of y', 'The number of trees'], e: 'The location and size of the zone are defined by the support vectors.' },
      { q: 'How does SVR describe a nonlinear relationship?', a: ['With the kernel trick: a linear band in more dimensions becomes a curved band in the original space', 'By deleting the outliers', 'By using a smaller ε', 'It cannot'], e: 'Project to more dimensions, define a linear zone, reproject with the inverse kernel function.' }
    ]
  });

  /* ------------------------------------------------------------ 12 */
  ch({
    title: 'K Nearest Neighbors (K-NN)', short: 'KNN', slides: '187-194', inter: 'KNN',
    steps: [
      { t: 'The idea: classes "a" and "o"', s: '187-188', h: `
        <ul><li>Usually for <b>classification</b> but also works for <b>regression</b>.</li><li>In the example here there are 2 classes "<b>a</b>" and "<b>o</b>".</li><li>Any <b>new observation</b> "<b>c</b>" must be classified into a class a or o.</li>
        <li>If we set <b>k = 3</b>, we draw circles around c until exactly k = 3 observations are included.</li><li>c will be classified according to the <b>majority</b> of the k observations. In this example, in the class "<b>o</b>".</li></ul>` },
      { t: 'Rank the distances, the k nearest vote', s: '189-191', deep: [{app: 'sim', id: 'bias-variance', t: 'Bias-Variance Tradeoff'}], fig: 'knn', h: `
        <p>We want to classify the <b>gray</b> observation into one of 3 classes: <b>growth</b>, <b>recession</b>, <b>normal</b>.</p>
        <ol start="0"><li><b>Look at the data.</b></li><li><b>Calculate distances:</b> we start by measuring the distances of the gray observation to all the others.</li><li><b>Find neighbours:</b> we rank the distances from shortest to longest, that is, in ascending order.</li><li><b>Vote on labels:</b> the k first neighbours vote for the class of the gray observation. In the slide, k = 3: yellow 2, green 1. So the gray observation is classified as yellow <span class="arrow">→</span> growth.</li></ol>
        <div class="key">What would be the answer if k = 4? Try it below. The choice of k significantly impacts the classification: compare k = 3 and k = 7.</div>
        <div data-fig="knn"></div>` },
      { t: 'General comments', s: '192', h: `
        <ul><li>For <b>binary classification</b> (2 classes), we choose an <b>odd</b> value for k so that there are <b>no ties</b>.</li><li>In general, k must <b>not</b> be a <b>multiple</b> of the <b>number of classes</b> when we have a problem with multiple classes, for the same reason.</li></ul>` },
      { t: 'Advantages and disadvantages', s: '193-194', deep: [{app: 'sim', id: 'feature-scaling', t: 'Feature Scaling'}], h: `
        <h4>Advantages</h4>
        <ul><li><b>Simplicity and intuition:</b> it is extremely easy to understand and implement. It does not require complex mathematical assumptions about the distribution of the data (non-parametric).</li>
        <li><b>No training phase (lazy learner):</b> K-NN does not "learn" a model in the traditional sense. It simply stores the data and does all the calculations at the time of prediction.</li>
        <li><b>Adaptability:</b> as new data are added, the algorithm adapts instantly, since "learning" occurs in real time during classification.</li>
        <li><b>Versatility:</b> it can be used for two-class or for multi-class problems.</li></ul>
        <h4>Disadvantages</h4>
        <ul><li><b>Computational cost:</b> as it calculates the distance of the new point from <i>all existing</i> points, it becomes very slow when the dataset is large.</li>
        <li><b>Noise sensitivity:</b> if there are errors in the data (outliers), K-NN can easily be misled, especially if the value of k is small.</li>
        <li><b>The "curse of dimensionality":</b> in spaces with too many variables (dimensions), all points end up at similar distances, so the "nearest" neighbours are not really near.</li>
        <li><b>Requires scaling:</b> distances are dominated by variables with large values (e.g. income) over small ones (e.g. age) unless the data are scaled.</li></ul>` }
    ],
    quiz: [
      { q: 'For a problem with 2 classes, which k avoids ties?', a: ['k = 5', 'k = 4', 'k = 2', 'k = 6'], e: 'For binary classification we choose an odd k so that there are no ties.' },
      { q: 'With k = 3, the nearest neighbours are growth, growth, recession. The new observation is classified as...', a: ['Growth', 'Recession', 'Normal', 'A tie'], e: 'The k first neighbours vote: growth 2, recession 1 → growth.' },
      { q: 'Why is K-NN called a "lazy learner"?', a: ['It stores the data and does all the calculations at the time of prediction', 'It needs very few data', 'It trains for a long time', 'It ignores the labels'], e: 'No training phase: it simply stores the data and calculates when we predict.' },
      { q: 'Income in euros (thousands) and age in years are used in K-NN without scaling. What goes wrong?', a: ['The distances are dominated by income, the variable with the large values', 'The distances are dominated by age', 'Nothing: K-NN does not use distances', 'K-NN cannot use 2 variables'], e: 'Requires scaling: large-valued variables dominate the distances.' },
      { q: 'With 3 classes, which k breaks the rule on the slide?', a: ['k = 6', 'k = 5', 'k = 7', 'k = 4'], e: 'The slide: k must not be a multiple of the number of classes; 6 is a multiple of 3.' }
    ]
  });

  /* ------------------------------------------------------------ 13 */
  ch({
    title: 'Ensemble learning techniques', short: 'Ensembles', slides: '195-199', inter: 'Ensembles',
    steps: [
      { t: 'The basic idea', s: '195', fig: 'ensembles', h: `
        <p><b>Basic idea:</b> training <b>multiple models</b> instead of just one.</p>
        <div class="cols3"><div class="fam uns"><h4>Bagging</h4></div><div class="fam rei"><h4>Stacking</h4></div><div class="fam sup"><h4>Boosting</h4></div></div>
        <div data-fig="ensembles"></div>` },
      { t: 'Bagging: bootstrapping and aggregating', s: '196', h: `
        <div class="flow"><span>Data set</span><i>→</i><span>Create n bootstrapped samples (random sampling with replacement)</span><i>→</i><span>Use the same algorithm on each</span><i>→</i><span>Voting or average</span><i>→</i><span>Prediction</span></div>
        <p>Question: what algorithm was like this?` + R('en1') + ` <span class="reveal-body" id="en1">→ Random forests</span></p>` },
      { t: 'Stacking 1 and stacking 2', s: '197-198', h: `
        <h4>Stacking 1</h4>
        <div class="flow"><span>Data set</span><i>→</i><span>n different algorithms; each algorithm uses the full data set</span><i>→</i><span>Voting or average</span><i>→</i><span>Prediction</span></div>
        <h4>Stacking 2 <span class="arrow">→</span> stacked generalization</h4>
        <div class="flow"><span>Data set</span><i>→</i><span>n different algorithms (weak learners), each with the full data set</span><i>→</i><span>Their predictions form a new data set</span><i>→</i><span>Train a random forest (meta learner)</span><i>→</i><span>Prediction</span></div>` },
      { t: 'Boosting', s: '199', h: `
        <ul><li>With <b>one algorithm</b> and <b>one dataset</b>.</li><li><b>Sequential correction of errors</b> made by previous models.</li></ul>
        <div class="flow"><span>Model 1</span><i>→</i><span>Misclassified observations get heavier weight for the next model</span><i>→</i><span>Model 2</span><i>→</i><span>...</span><i>→</i><span>Weighted vote by model accuracy</span><i>→</i><span>Result</span></div>
        <p>Question: what algorithm was like this?` + R('en2') + ` <span class="reveal-body" id="en2">→ XGBoost (it corrects the errors by fitting the residuals instead of re-weighting)</span></p>` }
    ],
    quiz: [
      { q: 'Bagging uses...', a: ['Bootstrapped samples and the same algorithm, then voting or average', 'Different algorithms on the full data set', 'One algorithm that corrects its errors sequentially', 'One decision tree'], e: 'Bootstrapping + aggregating: like random forests.' },
      { q: 'In stacking 2 (stacked generalization), what does the meta learner use as data?', a: ['The predictions of the n different algorithms', 'The original data only', 'Bootstrapped samples', 'The misclassified observations only'], e: 'The predictions form a new data set, used to train a random forest (meta learner).' },
      { q: 'In boosting, which observations get a heavier weight for the next model?', a: ['The misclassified ones', 'The correctly classified ones', 'The newest ones', 'A random half'], e: 'Sequential correction of errors: misclassified observations get heavier weight.' },
      { q: 'Which algorithm of this presentation is an example of boosting?', a: ['XGBoost', 'Random forests', 'K-Means', 'K-NN'], e: 'XGBoost builds trees sequentially, each correcting the errors of the previous ones.' }
    ]
  });

  P1.closing = {
    t: 'Ethical issues of AI', s: '200', h: `
      <p class="key"><b>Who should a self-driving car kill?</b> The baby or the grandma? It depends on where you're from (MIT Technology Review).</p>
      <p>A self-driving car cannot brake in time: it must choose path A or path B. Its choice is made by a model trained on data and rules that people wrote. Studies that asked millions of people around the world found that the "right" answer changes from country to country.</p>
      <ul><li>Who decides what the machine should do?</li><li>Who is responsible when the machine decides?</li><li>Can we explain the decision (XAI)?</li></ul>
      <p style="margin-top:14px">This is the end of Presentation 1. Next: <a href="#/p2/1/1">Presentation 2: Metrics to evaluate our forecasts</a>.</p>`
  };

  window.CLASS = { pres: [P1] };
})();
