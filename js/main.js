const screenDisplay = document.getElementById("screen");
const historyDisplay = document.getElementById("history");
const historyDelete = document.getElementById("history-delete");
// 一つ前の文字が数字でない時に1となる
let notNum = 0;

// 初期化する関数
function clearScreen() {
  if (confirm("式を削除")) {
    screenDisplay.value = "";
    notNum = 0;
  }
}

// 式から一文字づつ削除する関数
function deleteChar() {
  if (screenDisplay.value.length == 1) clearScreen();
  else {
    screenDisplay.value = screenDisplay.value.slice(0, -1);
    notNum = screenDisplay.value.slice(-1).match(/[+\-*/%.]/) == null ? 0 : 1;
  }
}

// 履歴のhtmlを作成する関数
function createFormulaHtml(formula, total, check) {
  let history = String(formula[0]);

  // 式を文字列として保存する
  for (let i = 1; i < formula.length; i++) {
    history +=
      formula[i] == "+"
        ? ` + ${formula[i + 1]}`
        : formula[i] == "-"
        ? ` - ${formula[i + 1]}`
        : formula[i] == "*"
        ? ` &#10005; ${formula[i + 1]}`
        : formula[i] == "/"
        ? ` / ${formula[i + 1]}`
        : ` % ${formula[i + 1]}`;
    i++;
  }

  // 履歴を保存するためのpタグを作成する
  const historyP = document.createElement("p");
  historyP.innerHTML = check
    ? history + " = " + total + `<i class="fa-solid fa-check"></i>`
    : history + " = " + total;
  historyDisplay.append(historyP);
}

// *、/、%を優先して計算し、配列に再代入する関数
function evaluatePriorityOperators(formula) {
  let temp = formula;

  // i番目が[*、/、%]のどれかだったら、i - 1番目とi + 1番目をi番目の演算子を使って計算する
  for (let i = 0; i < temp.length; i++) {
    if (temp[i] == "") continue;

    const keep = temp[i];
    const before = i - 1;
    const after = i + 1;

    temp[i] =
      temp[i] == "*"
        ? temp[i - 1] * temp[i + 1]
        : temp[i] == "/"
        ? temp[i - 1] / temp[i + 1]
        : temp[i] == "%"
        ? temp[i - 1] % temp[i + 1]
        : temp[i];

    if (keep == "*" || keep == "/" || keep == "%") {
      temp[before] = "";
      temp[after] = "";
    }
  }

  // 空文字を削除する
  temp = temp.filter((value) => value !== "");

  return temp;
}

// 文字列型数字のデータ型を変換し、配列に再代入する関数
function toNumber(formula) {
  for (let i = 0; i < formula.length; i++) {
    if (!isNaN(formula[i])) {
      formula[i] = Number(formula[i]);
    }
  }

  return formula;
}

// 式を計算する関数
function evaluateExpression(formula) {
  // "優先順位変更"にチェックが入っているか確認
  // formula.match(/[*/%]/) != nullを用いることで、[*,/,%]が入っていた時のみevaluatePriorityOperators関数を実行し、無駄な計算を省く
  const check =
    document.getElementById("switch").checked && formula.match(/[*/%]/) != null;
  const newFormula = check
    ? evaluatePriorityOperators(toNumber(formula.split(/(\+|\-|\*|\/|\%)/g)))
    : toNumber(formula.split(/(\+|\-|\*|\/|\%)/g));
  let total = newFormula[0];

  // 合計値を計算する
  for (let i = 1; i < newFormula.length; i++) {
    total =
      newFormula[i] == "+"
        ? total + newFormula[i + 1]
        : newFormula[i] == "-"
        ? total - newFormula[i + 1]
        : newFormula[i] == "*"
        ? total * newFormula[i + 1]
        : newFormula[i] == "/"
        ? total / newFormula[i + 1]
        : total % newFormula[i + 1];
    i++;
  }

  // toNumber関数をもう一度呼び出していて、非効率
  createFormulaHtml(toNumber(formula.split(/(\+|\-|\*|\/|\%)/g)), total, check);

  screenDisplay.value = total;
}

// イコール処理をするか判定する関数
function isEqualProcessing() {
  if (
    // 演算子を含み、最後が演算子、小数点でない時に実行
    screenDisplay.value.match(/[+\-*/%]/) &&
    screenDisplay.value.slice(-1).match(/[+\-*/%.]/) == null
  ) {
    evaluateExpression(screenDisplay.value);
  }
}

// スクリーン表示処理の関数
function showFormulaOnScreen(value) {
  // 最初に[+*/%.]は入力不可
  if (value.match(/[+*/%.]/) && screenDisplay.value == "") return false;
  else if (value.match(/[+\-*/%.]/)) {
    screenDisplay.value += notNum == 0 ? value : "";
    notNum = 1;
  } else if (value.match(/[+\-*/%.]/) == null) {
    screenDisplay.value += value;
    notNum = 0;
  }
}

// <!-- イベントリスナー -->
historyDelete.addEventListener("mouseover", function () {
  historyDelete.style.transform = "rotate(20deg)";
});

historyDelete.addEventListener("mouseout", function () {
  historyDelete.style.transform = "rotate(0deg)";
});

historyDelete.addEventListener("click", function () {
  if (confirm("履歴を削除")) {
    historyDisplay.innerHTML = "";
  }
});

// Enterキー、Backspaceキーを押した時の動き

document.onkeydown = function (key) {
  if (key.code == "Backspace") {
    deleteChar();
  } else if (key.code == "Enter") {
    key.preventDefault(); // フォームの送信をキャンセルする
    isEqualProcessing();
  }
};
// <---->
