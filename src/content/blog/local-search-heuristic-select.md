---
title: "局部搜索启发式策略综述"
description: "毕设文献阅读笔记 — GSAT、WalkSAT 及其变体（SKC、TABU、Novelty、R-Novelty、Novelty+、Novelty++）的伪代码与策略对比"
pubDate: "2020-03-13T02:53:16.000Z"
updatedDate: "2020-03-26T15:46:12.346Z"
tags: ["毕设", "文献阅读", "SAT", "局部搜索", "GSAT", "WalkSAT", "启发式算法"]
category: "毕设 / 文献阅读 / SAT 求解 / 局部搜索"
---

本文整理了 GSAT、GSAT+walk、WalkSAT 及其变体（SKC、TABU、Novelty、R-Novelty、Novelty+、Novelty++）的伪代码和策略描述，并对比各算法的核心策略差异。

---

## GSAT

```plain
begin
    for i = 1 : MAX_TRIES
        T = random generate a true assignment
        for j = 1 : MAX_FLIPS
            if T satisfied then return T
            p = 翻转之后使满足子句的个数增加最多的那个变量
                若有多个则随机从中选一个
            T = the assignment after flipping p
        end for
    end for
    return "no solution found"
end
```

## GSAT + Walk

在 GSAT 基础上引入**随机游走策略**：以一定概率随机选择变量翻转，以跳出局部最优。

## WalkSAT

```plain
begin
    for i = 1 : MAX_TRIES
        T = random generate a true assignment
        for j = 1 : MAX_FLIPS
            if T satisfied then return T
            随机选择一个不满足子句 c
            r = randomly generated from 0 to 1
            if r < wp then
                从 c 中随机选择一个变元翻转
            else
                从 c 中选择使 break-count 最小的变元翻转
            end if
        end for
    end for
end
```

**核心参数**：$wp$（walk probability，游走概率），即噪声参数。

## WalkSAT/SKC

在 WalkSAT 基础上改进：若存在 break-count 为 0 的变元，则**直接翻转**该变元（保证改善目标函数，无需随机选择）。

## WalkSAT/TABU

策略是选择一个变量以最大程度减少不满意子句数量。但在每个步骤中，**拒绝翻转过去 $t$ 步内已翻转的任何变量**；若所选不满意子句中的所有变量都是禁忌的，则选择其他不满意子句。禁忌表长度 $t$ 是噪声参数。

## WalkSAT/Novelty

按不满意子句总数对变量排序，但以**最近最少翻转**的变量打破平局。考虑最佳和次佳变量：
- 若最佳变量不是子句中最近翻转的变量，则选择它
- 否则，以概率 $p$ 选择次优变量，以概率 $1-p$ 选择最佳变量

## WalkSAT/R-Novelty

与 NOVELTY 相同，但当最佳变量是最近翻转的变量时，令 $n$ 为最佳变量与次最佳变量之间的目标函数之差：

| 条件 | 选择策略 |
|------|---------|
| $p < 0.5$ | 选择最佳 |
| $p = 0.5$ 且 $n = 1$ | 选择次佳 |
| $p \geq 0.5$ 且 $n > 1$ | 以 $2(p - 0.5)$ 概率选次佳，否则选最佳 |

R-NOVELTY 几乎是确定性的。为打破搜索中的确定性循环，**每翻转 100 次**，策略将从子句中随机选择一个变量。

## WalkSAT/Novelty+

以概率 $wp$ 从子句 $c$ 中随机选择一个变量翻转（random walk），以概率 $1-wp$ 执行 Novelty 策略。

## WalkSAT/Novelty++

以概率 $dp$（diversification probability）选择子句 $c$ 中**最近最少翻转**的变量（diversification），以概率 $1-dp$ 执行 Novelty 策略。

---

## 各算法核心策略对比

| 算法 | 核心策略 |
|------|---------|
| **GSAT** | 评估适应度，建立最好变元（最大适应度值）的候选列表，从中随机选择一个变量翻转 |
| **GWSAT** | 以概率 $wp$ 随机从所有不满足子句中选择一个变元翻转；否则建立最好变元（最小 break-count − make-count）的候选列表，从中随机选择 |
| **GSAT-Tabu** | 对非禁忌表中的变元，建立最好变元（最大适应度值）的候选列表，从中随机选择。禁忌表采用 FIFO 队列管理 |
| **HSAT** | 评估适应度，建立最好变元（若有多个则选择翻转 older 的）的候选列表，从中随机选择 |
| **HWSAT** | 以概率 $wp$ 随机选择一个不满足子句，从中随机选择一个变元；否则执行 HSAT 操作 |
| **WalkSAT** | 随机选择不满足子句；翻转后得到 break-count，建立候选解列表。若最好 break-count > 0，则以 $wp$ 概率随机选择变元，否则从候选解中随机选择 |
| **WalkSAT-Tabu** | 随机选择不满足子句，计算 break-count。若 break-count 为 0 则不放入禁忌表。从候选解中随机选择变量翻转 |
| **Novelty** | 随机选择不满足子句；对子句中所有变元通过 break-count − make-count 评分，建立最佳列表和次最佳列表；若最佳变元不是最近翻转的，则翻转它；否则以概率 $p$ 选择次最佳 |
| **Novelty+** | 以概率 $wp$ 随机选择变元翻转；否则执行 Novelty |
| **Novelty++** | 随机选择不满足子句，以概率 $dp$ 选择最近翻转的变元；否则执行 Novelty |
| **AdaptNovelty** | 若一段时间未有所改善，则提高噪声；否则减小噪声（$wp := wp - wp \cdot \phi / 2$） |

---

## 参考文献

1. Hoos, H.H. *On the Run-time Behaviour of Stochastic Local Search Algorithms for SAT*
2. McAllester, D., Selman, B., Kautz, H. *Diversification and Determinism in Local Search for Satisfiability*
3. UBCSAT: http://ubcsat.dtompkins.com/home
