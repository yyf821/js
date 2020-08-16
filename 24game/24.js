const e = selector => document.querySelector(selector)
const es = selector => document.querySelectorAll(selector)

const shuffle = function (arr) {
    let length = arr.length,
        temp,
        random;
    while (0 != length) {
        random = Math.floor(Math.random() * length)
        length--;
        // swap
        temp = arr[length];
        arr[length] = arr[random];
        arr[random] = temp;
    }
    return arr.slice(0, 4);
}

const initCards = function () {
    let index = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    let type = ['C', 'D', 'H', 'S']
    let cards = [];
    for (let i = 0; i < index.length; i++) {
        for (let j = 0; j < type.length; j++) {
            let card = index[i] + type[j]
            cards.push(card);
        }
    }
    return cards
}
const renderCards = function (cards) {
    let html = ''
    for (let i = 0; i < cards.length; i++) {
        const element = cards[i];
        html += `<img class="card-img" data-num="${element}" src="../cards/${element}.png" alt="${element}">`
    }
    let container = e('.cards')
    container.innerHTML = html
}
const bindEventReset = function (cards) {
    let option = e('#card-reset')
    option.addEventListener('click', function () {
        e('.answer').innerHTML = ''
        let arr = shuffle(cards)
        renderCards(arr)
    })
}

const getAllPossibleResult = function (a, b) {
    return [`(${a}+${b})`, `(${a}-${b})`, `(${b}-${a})`, `(${a}*${b})`, `(${a}/${b})`, `(${b}/${a})`];
}

const judgePoint24 = function (nums) {
    var str = [];
    const dfs = function (list) {
        if (list.length === 1) {
            return Math.abs(eval(list[0]) - 24) < 1e-6
        }
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                const next = [];
                for (let k = 0; k < list.length; k++) {
                    if (k !== i && k !== j) {
                        next.push(list[k]);
                    }
                }
                for (const value of getAllPossibleResult(list[i], list[j])) {
                    next.push(value);
                    if (dfs(next)) {
                        str.push(next[0])
                        // return true;
                    }
                    next.pop();
                }
            }
        }
        // return false;
    }
    dfs(nums);
    //结果去重
    str = str.map(s => delExcessBrackets(s));
    str = Array.from(new Set(str))
    str = filter(str, nums)
    return str
};

const cardToNum = (arr) => {
    let result = []
    let cards = initCards()
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        let index = cards.indexOf(element)
        index = Math.ceil((index + 1) / 4)
        result.push(index)
    }
    return result
}

const showAnswer = () => {
    let divs = es('.card-img')
    let arr = []
    for (i = 0; i < divs.length; i++) {
        let num = divs[i].dataset.num
        arr.push(num)
    }
    arr = cardToNum(arr)
    let result = judgePoint24(arr)
    let div = e('.answer')
    div.innerHTML = result.length === 0 ? '无解' : result.join('<br>')
}
const bindEventAnswer = function () {
    let button = e('#show-answer')
    button.addEventListener('click', function () {
        showAnswer()
    })
}
//全加，全乘算一种结果
const filter = function (list, nums) {
    let opList = ['+', '*']
    let op = ''
    for (let i = 0; i < list.length; i++) {
        const exr = list[i];
        for (let j = 0; j < opList.length; j++) {
            const str = opList[j];
            if (exr.split(str).length === 4) {
                op = str
                break
            }
        }

    }
    if (op) {
        list = list.filter(word => word.split(op).length !== 4);
        list.unshift(nums.join(op))
    }
    return list
}



//检测括号是否可以删除
const check = function (s, left, right) {
    let i;            //下标
    let leftCount;    //左括号统计

    //处理 ' -(a +|- b) '
    if (s[left - 1] === '-') {
        i = left;
        leftCount = 1;
        while (++i < right) {
            if (s[i] === '(') {
                leftCount++;
            }
            else if ((s[i] === '+' || s[i] === '-') && leftCount === 1) {
                return false;
            }
        }
    }

    //处理 ' /(a +|-|*|/ b) '
    if (s[left - 1] == '/') {
        return false;
    }

    //处理 ' +(a +|-|*|/ b) +|- '
    if (s[left - 1] != '*' && s[left - 1] != '/' &&
        s[right + 1] != '*' && s[right + 1] != '/') {
        return true;
    }

    //处理 ' *(a *|/ b) +|-|*|/ '
    i = left;
    leftCount = 1;
    while (++i < right) {
        if (s[i] == '(') {
            leftCount++;
        }
        else if ((s[i] == '*' || s[i] == '/') && leftCount == 1) {
            return true;
        }
    }
    return false;
}

//删除多余的括号
const delExcessBrackets = function (s) {
    let right = 0;
    let left = 0;
    let stack = []
    let del = []
    for (let i = 0; i < s.length; i++) {
        // 遍历，碰到(直接下标入栈，碰到)出栈
        if (s[i] === '(') {
            stack.push(i);
        } else if (s[i] === ')') {
            left = stack.pop()
            right = i
            //若检测结果为可以删除，那么标记括号位置删除
            if (check(s, left, right)) {
                del.push(left)
                del.push(right)
            }
        }
    }

    if (del) {
        del = del.sort(function (a, b) {
            return a - b;
        });
        s = s.split('')
        for (let i = 0; i < del.length; i++) {
            const n = del[i];
            s.splice(n - i, 1)
        }
        s = s.join('')
    }
    return s

}

const __main = () => {
    let cards = initCards()
    let arr = shuffle(cards)
    renderCards(arr)
    bindEventReset(cards)
    bindEventAnswer()
}

__main()

