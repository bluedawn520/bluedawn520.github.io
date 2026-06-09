---
title: "基于改进的遗传算法求解 3-SAT 问题"
description: "毕设文献阅读笔记 — 局部搜索 + 遗传算法 + 三路划分快速排序的混合策略"
pubDate: "2020-03-08T12:00:54.000Z"
updatedDate: "2020-03-08T12:04:18.705Z"
tags: ["毕设", "文献阅读", "遗传算法", "SAT", "3-SAT", "快速排序", "混合算法"]
category: "毕设 / 文献阅读 / 遗传算法 / SAT 求解"
---

本文将局部搜索算法策略、标准遗传算法（SGA）与**三路划分快速排序算法**相结合，提出了一种混合改进策略。核心思路：通过适应度函数对基准进行调节，运用改进的三路划分快速排序重新生成新的种群。

---

## 1. 局部搜索算法（LSA）框架

```plain
step 1:  rand(X);           // 随机产生问题 P 的一个真值指派
step 2:  t(X);              // 计算适应度函数值
step 3:  执行局部搜索改进当前解
        ...
step 10: End While;
step 11: 输出最优个体及相应适应度值
```

> **注**：原始笔记中 LSA 的伪代码不完整，步骤编号存在跳跃（1 → 2 → 3 → 10），中间过程未完整记录。

---

## 2. 三路划分快速排序策略

将快速排序的三路划分思想应用于种群排序：根据适应度值将种群划分为三类——优于 pivot、等于 pivot、劣于 pivot。

### 核心代码框架

```plain
void TSort(int l, int r){
    if(l >= r) return;

    // 选择 pivot 划分种群，并将其与 r 位置的染色体交换
    int pivot = 1 + rand() % (r - l + 1);
    exchangeX(pivot, r);

    // 双向扫描：left 与 right 为主动移动，lflag 与 rflag 为被动移动
    int left = 1, lflag = 1;
    int right = r - 1, rflag = r - 1;

    while(true){
        while(t(left) = t(r) && right >= 1){
            if(t(right) == t(pivot)){
                exchangeX(right, rflag);
                rflag--;
            }
            right--;
        }
        if(left >= right) break;
        exchangeX(right, left);
        left++;
        right--;
    }

    // 此时：左右最边上 == t(pivot)，靠左中间 < pivot，靠右中间 > pivot
    lflag--;
    left--;
    while(lflag >= 1){
        exchangeX(left, lflag);
        left--;
        lflag--;
    }
    rflag++;
    right++;
    // ...（原始笔记在此处中断）
}
```

---

> **注**：本文原始笔记内容不完整，关于 LSA 的完整流程、三路划分排序的后续步骤，以及与遗传算法的具体结合方式未完整记录。
