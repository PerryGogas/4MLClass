/* =====================================================================
   4MLClass content: Presentation 2 "Metrics to evaluate our forecasts"
   (slides 1 to 50; activities 27 and 51 are left out), in slide order
   and slide wording. In every quiz item the CORRECT answer is FIRST;
   the app shuffles the options with a fixed seed.
   (c) 2026 Periklis Gogas, EMEF Lab.
   ===================================================================== */
(function () {
  'use strict';
  const R = (id, label) => ' <button type="button" class="btn-ghost btn-small reveal-btn" data-reveal="' + id + '">' + (label || 'Show the answer') + '</button>';
  const CM = (tn, fp, fn, tp, h) => '<table class="cm-tbl"><thead><tr><th colspan="2" rowspan="2"></th><th colspan="2">Predicted</th></tr><tr><th>' + (h ? h[0] : '0') + '</th><th>' + (h ? h[1] : '1') + '</th></tr></thead><tbody>' +
    '<tr><th rowspan="2" class="cm-act">Actual</th><th>' + (h ? h[0] : '0') + '</th><td class="cm-ok"><small>TN</small>' + tn + '</td><td class="cm-bad"><small>FP</small>' + fp + '</td></tr>' +
    '<tr><th>' + (h ? h[1] : '1') + '</th><td class="cm-bad"><small>FN</small>' + fn + '</td><td class="cm-ok"><small>TP</small>' + tp + '</td></tr></tbody></table>';

  const P2 = { id: 'p2', title: 'Metrics to evaluate our forecasts', sub: 'Presentation 2 &middot; How good are our models? &middot; slides 1 to 50 &middot; 6 chapters', chapters: [] };
  const ch = c => P2.chapters.push(c);

  /* ------------------------------------------------------------ 1 */
  ch({
    title: 'Machine learning metrics', short: 'ML metrics', slides: '1-4',
    steps: [
      { t: 'How good are our models?', s: '1-3', h: `
        <ul><li><b>After the training</b> we need to <b>evaluate</b> the models.</li><li>We use various <b>metrics</b>:</li></ul>
        <h4>1. Classification</h4>
        <div class="tbl-wrap"><table class="tbl"><tbody>
        <tr><td><b>Accuracy</b></td><td>how good is the model overall?</td></tr>
        <tr><td><b>Misclassification rate</b></td><td>how bad is the model overall?</td></tr>
        <tr><td><b>Sensitivity (recall)</b></td><td>what percentage of 1s are forecasted correctly?</td></tr>
        <tr><td><b>Specificity</b></td><td>what percentage of 0s are forecasted correctly?</td></tr>
        <tr><td><b>Precision</b></td><td>from the 1s forecasted, how many are correct?</td></tr>
        <tr><td><b>ROC – AUC</b></td><td>probability that a random positive gets a higher predicted probability than a random negative</td></tr>
        <tr><td><b>F1</b></td><td>balancing sensitivity (recall) and precision</td></tr>
        <tr><td><b>F0.5, F2, etc.</b></td><td>F0.5 gives more weight to precision, F2 to sensitivity</td></tr></tbody></table></div>` },
      { t: 'Regression metrics', s: '4', h: `
        <h4>2. Regression</h4>
        <div class="tbl-wrap"><table class="tbl"><tbody>
        <tr><td><b>MSE</b></td><td><span class="tex">MSE = \\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat y_i)^2</span></td></tr>
        <tr><td><b>RMSE</b></td><td><span class="tex">RMSE = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat y_i)^2}</span></td></tr>
        <tr><td><b>MAE</b></td><td><span class="tex">MAE = \\frac{1}{n}\\sum_{i=1}^{n}|y_i-\\hat y_i|</span></td></tr>
        <tr><td><b>MPE</b></td><td><span class="tex">MPE = \\frac{100\\%}{n}\\sum_{t=1}^{n}\\frac{a_t-f_t}{a_t}</span></td></tr>
        <tr><td><b>MAPE</b></td><td><span class="tex">MAPE = \\frac{100}{n}\\sum_{t=1}^{n}\\left|\\frac{A_t-F_t}{A_t}\\right|</span></td></tr>
        <tr><td><b>R²</b></td><td><span class="tex">R^2 = 1 - \\frac{RSS}{TSS}</span></td></tr></tbody></table></div>
        <p>We will see them in detail in the <a href="#/p2/6/1">regression metrics</a> chapter.</p>` }
    ],
    quiz: [
      { q: 'Which metric answers "what percentage of 1s are forecasted correctly?"', a: ['Sensitivity (recall)', 'Specificity', 'Precision', 'Accuracy'], e: 'Sensitivity: the percentage of actual 1s that we forecast as 1.' },
      { q: 'Which metric answers "from the 1s forecasted, how many are correct?"', a: ['Precision', 'Sensitivity', 'Specificity', 'Misclassification rate'], e: 'Precision looks at the column of predicted 1s.' },
      { q: 'Forecasting the price of electricity, which metrics do we use?', a: ['Regression metrics such as RMSE, MAE and MAPE', 'Accuracy and specificity', 'The confusion matrix', 'ROC and AUC'], e: 'The price is continuous: a regression problem, evaluated with regression metrics.' }
    ]
  });

  /* ------------------------------------------------------------ 2 */
  ch({
    title: 'The confusion matrix and its metrics', short: 'Confusion matrix', slides: '5-20', inter: 'Confusion matrix',
    steps: [
      { t: 'The confusion matrix', s: '5-6', deep: [{app: 'sim', id: 'cross-validation', t: 'Cross-Validation'}], h: `
        <ul><li><b>Extremely important</b> in evaluating classification models!</li><li>We <b>evaluate all</b> our predictions <span class="arrow">→</span> training and validation.</li><li>Looks like this <span class="arrow">→</span> what are <b>TP</b>, <b>TN</b>, <b>FP</b>, <b>FN</b>?</li></ul>
        <div class="cm-wrap">` + CM('TN', 'FP', 'FN', 'TP') + `<div><ul><li><b>TP</b> (True Positive): actual 1, predicted 1.</li><li><b>TN</b> (True Negative): actual 0, predicted 0.</li><li><b>FP</b> (False Positive): actual 0, predicted 1.</li><li><b>FN</b> (False Negative): actual 1, predicted 0.</li></ul></div></div>` },
      { t: 'Creating the confusion matrix: 12 observations', s: '7-10', fig: 'cmatrix', h: `
        <p>Let's say we have these predictions for <b>12 observations</b> (train or validation): 1 <span class="arrow">→</span> infected, 0 <span class="arrow">→</span> not infected (or 1 <span class="arrow">→</span> bankruptcy, 0 <span class="arrow">→</span> no bankruptcy). <b>Green</b> <span class="arrow">→</span> correct classifications; <b>red</b> <span class="arrow">→</span> misclassifications.</p>
        <p>From that we can create the confusion matrix: <b>add the number of cases</b>. In absolute numbers <span class="arrow">→</span> TN 3, FP 1, FN 2, TP 6. In percentages <span class="arrow">→</span> 75%, 25%, 25%, 75%.</p>
        <div data-fig="cmatrix"></div>` },
      { t: 'An actual case, and the process for each observation', s: '11-12', h: `
        <p>From Orange we get the <b>number of cases</b>, or the <b>percentages</b> as a proportion of the actual class:</p>
        <div class="cols2"><div>` + CM(195, 20, 17, 88) + `</div><div>` + CM('90.7%', '9.3%', '16.2%', '83.8%') + `</div></div>
        <h4>The process of creating the confusion matrix</h4>
        <p>The ML model predicts, for each observation:</p>
        <ul><li>If <b>predicted 1</b> it can be: actual 1 <span class="arrow">→</span> <b>True</b> Positive; actual 0 <span class="arrow">→</span> <b>False</b> Positive.</li><li>If <b>predicted 0</b> it can be: actual 1 <span class="arrow">→</span> <b>False</b> Negative; actual 0 <span class="arrow">→</span> <b>True</b> Negative.</li></ul>` },
      { t: 'The confusion matrix metrics', s: '13-18', h: `
        <ol><li><b>Accuracy:</b> percentage of <b>correct</b> predictions. <span class="tex">Accuracy = \\frac{all\\ correct}{all} = \\frac{TP+TN}{TP+FN+FP+TN}</span></li>
        <li><b>Misclassification rate:</b> percentage of <b>incorrect</b> predictions. <span class="tex">\\frac{all\\ incorrect}{all} = \\frac{FN+FP}{TP+FN+FP+TN} = 1 - Acc</span></li>
        <li><b>Sensitivity (recall):</b> percentage of correct predictions for the class 1 (True Positive Rate) <span class="arrow">→</span> how good we are in detecting all class 1 cases. <span class="tex">Sensitivity = \\frac{true\\ positives}{all\\ positives} = \\frac{TP}{TP+FN} = \\frac{TP}{P}</span></li>
        <li><b>Specificity:</b> percentage of correct predictions for the class 0 (True Negative Rate) <span class="arrow">→</span> how good we are in detecting all class 0 cases. <span class="tex">Specificity = \\frac{true\\ negatives}{all\\ negatives} = \\frac{TN}{TN+FP} = \\frac{TN}{N}</span><br><b>False alarm = 1 − specificity</b> <span class="arrow">→</span> 0s forecasted as 1s <span class="arrow">→</span> FP/N: they will be found positive but are negative.</li>
        <li><b>Precision:</b> among those I predicted positive, how many did I get correct? Positive Predictive Value. <span class="tex">Precision = \\frac{true\\ positives}{predicted\\ positives} = \\frac{TP}{TP+FP}</span></li></ol>
        <p>Go back to the <a href="#/p2/2/2">interactive confusion matrix</a> and point at each metric to see which cells it uses.</p>` },
      { t: 'Forecasting bank failures', s: '19', h: `
        <p>Actual case: train with the <b>linear SVM</b> model.</p>
        <div class="cm-wrap">` + CM(929, 33, 41, 440) + `<div><ul><li>Accuracy = (440 + 929) / (440 + 929 + 33 + 41) = <b>94.9%</b></li><li><b>41 missed failures</b> (FN): failed banks predicted as healthy.</li><li><b>33 false alarms</b> (FP): healthy banks predicted as failed.</li></ul></div></div>` },
      { t: 'Multiclass confusion matrix', s: '20', h: `
        <p>Predicting the <b>type of flower</b> <span class="arrow">→</span> 3 classes.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Actual / Predicted</th><th>Iris-setosa</th><th>Iris-versicolor</th><th>Iris-virginica</th><th>Σ</th></tr></thead><tbody>
        <tr><td>Iris-setosa</td><td><b>50</b></td><td>0</td><td>0</td><td>50</td></tr><tr><td>Iris-versicolor</td><td>0</td><td><b>39</b></td><td>11</td><td>50</td></tr><tr><td>Iris-virginica</td><td>0</td><td>8</td><td><b>42</b></td><td>50</td></tr><tr><td>Σ</td><td>50</td><td>47</td><td>53</td><td>150</td></tr></tbody></table></div>
        <p>The correct predictions are on the diagonal. Accuracy?` + R('mc1') + ` <span class="reveal-body" id="mc1">→ (50 + 39 + 42) / 150 = 87.3%</span></p>` }
    ],
    quiz: [
      { q: 'An observation is actually 0 but the model predicts 1. It is a...', a: ['False Positive (FP)', 'False Negative (FN)', 'True Positive (TP)', 'True Negative (TN)'], e: 'Predicted 1 (positive), and it is wrong (false).' },
      { q: 'TP = 6, FN = 2, FP = 1, TN = 3. What is the sensitivity?', a: ['75%', '86%', '60%', '25%'], e: 'TP / (TP + FN) = 6 / 8 = 75%.' },
      { q: 'TP = 6, FN = 2, FP = 1, TN = 3. What is the precision?', a: ['86%', '75%', '67%', '50%'], e: 'TP / (TP + FP) = 6 / 7 = 85.7%.' },
      { q: 'Specificity is 95%. What are the false alarms?', a: ['5%', '95%', '0%', 'It depends on the sensitivity'], e: 'False alarm = 1 − specificity.' },
      { q: 'In the bank failures SVM (TP 440, FN 41, FP 33, TN 929), what are the 41?', a: ['Missed failures: failed banks predicted as healthy', 'False alarms: healthy banks predicted as failed', 'Correctly found failures', 'Healthy banks predicted as healthy'], e: 'FN: actual 1 (failed), predicted 0.' }
    ]
  });

  /* ------------------------------------------------------------ 3 */
  ch({
    title: 'Is accuracy that important?', short: 'Is accuracy important?', slides: '21-26', inter: 'Samples A, B, C',
    steps: [
      { t: 'Samples A, B and C', s: '21-24', fig: 'cmatrix', h: `
        <p><b>Spoiler alert</b> <span class="arrow">→</span> not always. Our model produces these classifications (blue = 1, red = 0):</p>
        <div class="cols3">
          <div class="mapcol"><h5>Sample A: Blue 11, Red 9</h5>Sensitivity = 63.6% (7/11)<br>Specificity = 66.7% (6/9)<br><b>Accuracy = (7 + 6)/(11 + 9) = 65%</b><br>Is that good? With a coin toss we get 50%.</div>
          <div class="mapcol"><h5>Sample B: Blue 8, Red 102</h5>Sensitivity = 37.5% (3/8)<br>Specificity = 97% (99/102)<br><b>Accuracy = (3 + 99)/(8 + 102) = 92.7%</b><br>Is it better? It depends on the target! Iceberg, infection, fire, etc.</div>
          <div class="mapcol"><h5>Sample C: Blue 1, Red 99</h5>Sensitivity = 0% (0/1)<br>Specificity = 100% (99/99)<br><b>Accuracy = (0 + 99)/(1 + 99) = 99%</b><br>Is this better? Again, it depends...? <b>No!</b> The model never finds a blue.</div>
        </div>
        <p>The slides also show "False Positives" (3/10 in Sample A: of the 10 predicted blue, 3 are red) and "False Negatives" (4/10: of the 10 predicted red, 4 are blue).</p>
        <div data-fig="cmatrix" data-pre="A"></div>` },
      { t: 'Sensitivity, specificity and the threshold', s: '25-26', h: `
        <ul><li>Models actually give a <b>probability</b> that observation i is class 1.</li><li>By default <span class="arrow">→</span> if Prob(Class 1) &gt; 0.50 <span class="arrow">→</span> classify as 1 <span class="arrow">→</span> else as 0.</li>
        <li><b>Sensitivity</b> and <b>specificity</b> need to be maximized, ideally = 1. The best possible model has both = 1. This is almost never the case.</li>
        <li>We use <b>trade-offs</b> between sensitivity and specificity: we do this by changing the <b>threshold T</b> of the classification, i.e. T = 0.80 or T = 0.30, etc., to optimize the model. We discuss this trade-off in detail next using the <b>ROC curve</b>.</li></ul>
        <h4>Changing the threshold to find more 1s</h4>
        <ul><li>Observations move from column to column, in the <b>same row</b>: more observations classified before as 0 are now 1. Some are correctly and some wrongly reclassified.</li>
        <li>If from <b>FN → TP</b> <span class="arrow">→</span> sensitivity ↑, precision ↑.</li>
        <li>If from <b>TN → FP</b> <span class="arrow">→</span> sensitivity no change, precision ↓, specificity ↓, FP ↑ <span class="arrow">→</span> false alarms ↑.</li></ul>` }
    ],
    quiz: [
      { q: 'Sample C: 1 blue and 99 red; the model predicts all red. Accuracy is 99%. Is it a good model for finding blues?', a: ['No: its sensitivity is 0%, it never finds a blue', 'Yes: 99% accuracy is excellent', 'Yes: specificity is 100%', 'We cannot say without the ROC curve'], e: 'With rare classes, a model that always predicts the majority gets a high accuracy but is useless.' },
      { q: 'We lower the threshold T and one observation moves from FN to TP. What happens?', a: ['Sensitivity ↑ and precision ↑', 'Sensitivity ↓', 'Specificity ↓', 'Nothing changes'], e: 'From FN → TP: sensitivity ↑, precision ↑.' },
      { q: 'We lower T and one observation moves from TN to FP. What happens to the false alarms?', a: ['They increase', 'They decrease', 'They stay the same', 'They become zero'], e: 'From TN → FP: specificity ↓, FP ↑ → false alarms ↑.' },
      { q: 'Sample A has accuracy 65%. Compared with a coin toss...', a: ['It is better than a coin toss (50%), but is it good enough? It depends on the target', 'It is worse than a coin toss', 'It is perfect', 'It is the same as a coin toss'], e: 'With a coin toss we get 50%; whether 65% is enough depends on the problem.' }
    ]
  });

  /* ------------------------------------------------------------ 4 */
  ch({
    title: 'Optimizing metrics: changing the threshold', short: 'Threshold and cost', slides: '28-41', inter: 'Threshold T',
    steps: [
      { t: 'A logit model for bank defaults', s: '28-36', fig: 'threshold', h: `
        <ul><li><b>x</b> independent variable <span class="arrow">→</span> <b>debt-to-equity ratio</b> ↑ <span class="arrow">→</span> risk of default ↑</li><li><b>y</b> dependent variable <span class="arrow">→</span> <b>probability of default</b></li><li>Forecast bank defaults <span class="arrow">→</span> use a <b>logit</b> model. <b>Blue</b> <span class="arrow">→</span> healthy, <b>red</b> <span class="arrow">→</span> failed.</li></ul>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Slides</th><th>Threshold</th><th>Result</th></tr></thead><tbody>
        <tr><td>30</td><td>T = 0.5</td><td>Sensitivity = 100% (5/5), specificity = 100% (4/4), false alarms = 0%</td></tr>
        <tr><td>31, 34</td><td>T = 0.5</td><td>Now one failed bank has a low probability: sensitivity (failed) = 80% (4 of 5), specificity = 100% (4 of 4), precision = 100% (4/4), accuracy = 88.89% (8/9). False Negative = 1. What can we do?</td></tr>
        <tr><td>32</td><td>T = 0.3</td><td>Sensitivity = 100% (5 of 5), precision = 100% (5/5), specificity = 100% (4 of 4), false alarms = 0%</td></tr>
        <tr><td>35, 36</td><td>T = 0.2</td><td>Assume the model cannot produce T = 0.3; we can only use T = 0.2. Sensitivity = 100% (5 of 5), precision = 83% (5/6), specificity = 75% (3 of 4), false alarms = 25%. We now have a False Positive. What is the cost?</td></tr></tbody></table></div>
        <div data-fig="threshold"></div>` },
      { t: 'Real forecasting is not that simple', s: '33', h: `
        <ul><li>Real forecasting is <b>not that simple</b>: no clear cut with 100% accuracy.</li><li>We must <b>choose</b> a threshold and a <b>trade-off</b> between more:<ul><li>False Positives</li><li>False Negatives</li></ul></li><li>What do we prefer?</li><li><b>It depends on the target!</b></li></ul>` },
      { t: 'The cost function', s: '37-38', deep: [{app: 'sim', id: 'cross-validation', t: 'Cross-Validation'}], h: `
        <ul><li>Example with predicting: <b>a fire</b>, <b>an iceberg</b>, <b>a serious infection</b>.</li><li>A misclassification is associated with a <b>cost</b>:<ul><li>Cost of FP <span class="arrow">→</span> false fire</li><li>Cost of FN <span class="arrow">→</span> false no fire</li></ul></li><li>In these cases <span class="arrow">→</span> <b>costs are not symmetrical!</b> Use a <b>cost function</b>.</li></ul>
        <div class="key"><span class="tex">C = (\\text{Cost of a FP}) \\times FP + (\\text{Cost of a FN}) \\times FN</span></div>
        <ul><li>Try to <b>minimize</b> this <span class="arrow">→</span> optimal model.</li><li>This is an extra <b>parameter</b> we optimize in the <b>training</b> process during <b>cross-validation</b>.</li></ul>
        <div class="ex"><b>Example: bank failures.</b> Cost (FP) <span class="arrow">→</span> cost for due diligence, control and supervision <span class="arrow">→</span> €100,000. Cost (FN) <span class="arrow">→</span> bank failure, possible transmission to the bank sector and the economy <span class="arrow">→</span> €100,000,000. Ratio of costs <span class="arrow">→</span> 1000 to 1.</div>
        <p>Try the costs in the <a href="#/p2/4/1">threshold figure</a>: press "Find the lowest-cost T".</p>` },
      { t: 'Type I and Type II error', s: '39', h: `
        <ul><li><b>FP</b> <span class="arrow">→</span> <b>Type 1</b> error</li><li><b>FN</b> <span class="arrow">→</span> <b>Type 2</b> error</li></ul>
        <div class="cols2"><div class="ex"><b>Type 1 error (FP):</b> a doctor tells a man "You're pregnant".</div><div class="ex"><b>Type 2 error (FN):</b> a doctor tells a pregnant woman "You're not pregnant".</div></div>` },
      { t: 'The SVM on bank failures and a naive model', s: '40-41', h: `
        <p>From our <b>SVM forecasting model</b> on banking failures we got:</p>
        <div class="cm-wrap">` + CM(1157, 7, 3, 112, ['Solvent', 'Insolvent']) + `<div><ul><li>Accuracy = (112 + 1157)/1279 = <b>99.22%</b></li><li>Sensitivity = 112/(112 + 3) = <b>97.39%</b></li><li>Specificity = 1157/(1157 + 7) = <b>99.40%</b></li><li>False alarms = 1 − specificity = <b>0.60%</b></li></ul></div></div>
        <h4>If we use a naive model = "all are insolvent"</h4>
        <div class="cm-wrap">` + CM(0, 1164, 0, 115, ['Solvent', 'Insolvent']) + `<div><ul><li>Sensitivity = 115/115 = 100%</li><li>Accuracy = 115/1279 = 8.9%</li><li>Specificity = 0/1164 = 0%</li><li>False alarms = 1 − spec = 100%</li></ul></div></div>
        <p>We detect <b>all</b> insolvent banks, 115/115. But we get <b>100% false alarms</b>! Not a good model...</p>` }
    ],
    quiz: [
      { q: 'At T = 0.5 one failed bank has probability 0.35. What kind of error is it?', a: ['A False Negative', 'A False Positive', 'A True Negative', 'No error'], e: '0.35 < 0.5, so the failed bank is classified as healthy: a FN.' },
      { q: 'We lower the threshold from T = 0.5 to T = 0.2. What happens to the sensitivity?', a: ['It increases or stays the same', 'It always decreases', 'It becomes 0', 'It is not affected by T'], e: 'With a lower T more banks are classified as failed, so we find more of the failed ones.' },
      { q: 'A FN costs €100,000,000 and a FP €100,000. Which threshold do we prefer?', a: ['A lower threshold: we accept more false alarms to avoid missed failures', 'A higher threshold: fewer false alarms', 'Always T = 0.5', 'The threshold does not matter'], e: 'Costs are not symmetrical: a missed failure costs 1000 times more.' },
      { q: 'A False Positive is also called...', a: ['A Type 1 error', 'A Type 2 error', 'A true alarm', 'A missed case'], e: 'FP → Type 1 error; FN → Type 2 error.' },
      { q: 'The naive model "all are insolvent" has sensitivity 100%. Why is it not a good model?', a: ['Its specificity is 0%: 100% false alarms', 'Its sensitivity is too low', 'Its accuracy is 99%', 'It uses too many variables'], e: 'We detect all insolvent banks, but every solvent bank is a false alarm.' }
    ]
  });

  /* ------------------------------------------------------------ 5 */
  ch({
    title: 'The ROC curve and AUC', short: 'ROC and AUC', slides: '42-46', inter: 'ROC curve',
    steps: [
      { t: 'The ROC curve: Receiver Operating Characteristic', s: '42-45', fig: 'roc', h: `
        <ul><li>The ROC curve is a fundamental graphical tool used to evaluate the performance of <b>binary classification models</b>.</li>
        <li>It illustrates the <b>trade-off</b> between the <b>True Positive Rate</b> (TPR, sensitivity) and the <b>False Positive Rate</b> (FPR, false alarms) across various threshold settings.</li>
        <li>The models produce a <b>probability (p)</b> that an observation is class 1 (positive). We compare p with the threshold T we set (default 0.50): if p &gt; T <span class="arrow">→</span> classify as 1 (positive); if p ≤ T <span class="arrow">→</span> classify as 0 (negative).</li>
        <li>From top right <span class="arrow">→</span> threshold = 0 <span class="arrow">→</span> all 1. To bottom left <span class="arrow">→</span> threshold = 1 <span class="arrow">→</span> all 0.</li>
        <li>The curve starts at (0, 0) and ends at (1, 1), with each point representing a different threshold setting. To create the ROC curve, we plot the TPR against the FPR at various threshold levels.</li>
        <li>This gives the ability to <b>choose the point</b> on the ROC that is optimal for the problem at hand (A, B or C).</li></ul>
        <div data-fig="roc"></div>` },
      { t: 'Various ROC curves and the AUC', s: '46', fig: 'roc', h: `
        <div class="tbl-wrap"><table class="tbl"><tbody><tr><td><b>Perfect</b></td><td>AUC = 1.0</td></tr><tr><td><b>Good</b></td><td>AUC = 0.8</td></tr><tr><td><b>Random</b></td><td>AUC = 0.5</td></tr></tbody></table></div>
        <div class="key"><b>Intuitive definition of AUC:</b> "If we randomly select <b>one positive</b> instance and <b>one negative</b> instance from our dataset, the AUC is the <b>probability</b> that the model will assign a <b>higher predicted probability to the positive instance</b> than to the negative one."</div>
        <p>Tick "Show perfect, good and random curves" and draw pairs of banks to check the definition.</p>
        <div data-fig="roc"></div>` }
    ],
    quiz: [
      { q: 'What do the two axes of the ROC curve show?', a: ['False positive rate (1 − specificity) and sensitivity (TP rate)', 'Accuracy and precision', 'The threshold and the accuracy', 'MSE and R²'], e: 'We plot the TPR against the FPR at various threshold levels.' },
      { q: 'At threshold = 0 every observation is classified as 1. Where is this point on the ROC curve?', a: ['(1, 1), top right', '(0, 0), bottom left', '(0, 1), top left', 'In the middle'], e: 'All 1 → every positive found (TPR = 1) and every negative is a false alarm (FPR = 1).' },
      { q: 'A model has AUC = 0.5. It is...', a: ['As good as random guessing', 'Perfect', 'Good', 'Worse than random'], e: 'Random → AUC = 0.5; the diagonal of the ROC plot.' },
      { q: 'AUC = 0.8 means that...', a: ['A random positive gets a higher probability than a random negative 80% of the time', '80% of the observations are classified correctly', 'Sensitivity is 80%', 'The threshold is 0.8'], e: 'This is the intuitive definition of AUC.' }
    ]
  });

  /* ------------------------------------------------------------ 6 */
  ch({
    title: 'Regression metrics', short: 'Regression metrics', slides: '47-50', inter: 'Drag the points',
    steps: [
      { t: 'Common regression metrics', s: '47-49', deep: [{app: 'sim', id: 'linear-regression', t: 'Linear Regression'}, {app: 'sim', id: 'ts-validation', t: 'Time-Series Validation'}], h: `
        <ol><li><b>Mean Squared Error (MSE)</b> <span class="tex">MSE = \\frac{1}{N}\\sum_{i=1}^{N}(y_i-\\hat y_i)^2</span></li>
        <li><b>Root Mean Squared Error (RMSE)</b> <span class="tex">RMSE = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N}(y_i-\\hat y_i)^2}</span></li>
        <li><b>Mean Absolute Error (MAE)</b> <span class="tex">MAE = \\frac{1}{N}\\sum_{i=1}^{N}|y_i-\\hat y_i|</span></li>
        <li><b>Mean Absolute Percentage Error (MAPE)</b> <span class="tex">MAPE = \\frac{1}{N}\\sum_{i=1}^{N}\\left|\\frac{y_i-\\hat y_i}{y_i}\\right|</span> (in %)</li>
        <li><b>R-squared</b> <span class="tex">R^2 = 1-\\frac{RSS}{TSS} = 1-\\frac{\\sum (y_i-\\hat y_i)^2}{\\sum (y_i-\\bar y)^2}</span></li></ol>
        <ul><li>MSE and RMSE <b>square</b> the errors: large errors count much more. RMSE is in the units of y.</li><li>MAE is the average size of the errors, in the units of y.</li><li>MAPE is in %: easy to compare across series, but it cannot be used when some yᵢ = 0.</li><li>R² is the share of the variance of y explained by the model (1 = perfect).</li></ul>` },
      { t: 'The errors around the regression line', s: '50', deep: [{app: 'sim', id: 'linear-regression', t: 'Linear Regression'}, {app: '4cast'}], fig: 'regMetrics', h: `
        <p>Each actual value <b>yᵢ</b> is compared with its forecast <b>ŷᵢ</b> on the regression line. The vertical distances are the errors that all the metrics use.</p>
        <div data-fig="regMetrics"></div>` }
    ],
    quiz: [
      { q: 'One forecast has a very large error (an outlier). Which metric reacts the most?', a: ['MSE, because it squares the errors', 'MAE', 'MAPE', 'None: all react the same'], e: 'Squaring makes large errors count much more.' },
      { q: 'Errors are 2, −2, 4 and −4. What is the MAE?', a: ['3', '0', '10', '2'], e: 'MAE = (2 + 2 + 4 + 4)/4 = 3.' },
      { q: 'Errors are 2, −2, 4 and −4. What is the MSE?', a: ['10', '3', '√10', '0'], e: 'MSE = (4 + 4 + 16 + 16)/4 = 10; RMSE = √10 ≈ 3.16.' },
      { q: 'Why can MAPE not be used when some actual values are 0?', a: ['It divides by the actual value yᵢ', 'It squares the errors', 'It needs a classification model', 'It is always 100%'], e: 'MAPE = average of |(yᵢ − ŷᵢ)/yᵢ|: we cannot divide by 0.' }
    ]
  });

  window.CLASS.pres.push(P2);
})();
