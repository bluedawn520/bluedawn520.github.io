---
title: "C/C++ 学习笔记"
description: "C/C++ 基础语法与核心概念整理：inttypes.h 格式宏、左值右值、位运算、递归、结构体、排序算法等"
pubDate: "2021-03-14T07:43:54.000Z"
updatedDate: "2021-03-16T20:00:33.678Z"
tags: ["C", "C++", "学习笔记", "编程基础", "数据结构"]
category: "学习 / 编程 / C/C++"
---

## 目录

1. [inttypes.h 格式宏](#inttypes.h)
2. [左值与右值](#左值与右值)
3. [位运算](#位运算)
4. [逻辑运算符短路特性](#逻辑与或)
5. [随机数设置](#设置随机数)
6. [头递归与尾递归](#头递归--尾递归)
7. [函数指针做参数](#函数地址做函数参数)
8. [continue 与 break](#continue--break)
9. [数组初始化](#数组初始化)
10. [折半查找](#折半查找)
11. [排序算法](#排序)
12. [字符串字面量](#字符串字面量)
13. [求质数](#求质数)
14. [指针大小](#指针大小)
15. [二维数组创建](#二维数组创建)
16. [矩阵旋转与螺旋输出](#矩阵旋转--螺旋输出)
17. [sprintf 使用注意](#sprintf-使用注意)
18. [malloc 与 calloc](#malloc--calloc)
19. [void 与 int 指针转换](#void--int)
20. [结构体与位域](#结构体)
21. [共用体](#共用体)
22. [枚举](#枚举)
23. [约瑟夫环](#约瑟夫环)

---

## inttypes.h

标准 C 函数库头文件，定义了各种整数输入输出格式转换宏。

### 输出格式宏

| 宏 | 格式字符串 |
|----|-----------|
| PRId8 | "hhd" |
| PRId16 | "hd" |
| PRId32 | "d" |
| PRId64 | "lld" |
| PRIi8 | "hhi" |
| PRIi16 | "hi" |
| PRIi32 | "i" |
| PRIi64 | "lli" |
| PRIo8 | "hho" |
| PRIo16 | "ho" |
| PRIo32 | "o" |
| PRIo64 | "llo" |
| PRIu8 | "hhu" |
| PRIu16 | "hu" |
| PRIu32 | "u" |
| PRIu64 | "llu" |
| PRIx8 | "hhx" |
| PRIx16 | "hx" |
| PRIx32 | "x" |
| PRIx64 | "llx" |
| PRIX8 | "hhX" |
| PRIX16 | "hX" |
| PRIX32 | "X" |
| PRIX64 | "llX" |

### 输入格式宏

| 宏 | 格式字符串 |
|----|-----------|
| SCNd8 | "hhd" |
| SCNd16 | "hd" |
| SCNd32 | "d" |
| SCNd64 | "lld" |
| SCNi8 | "hhi" |
| SCNi16 | "hi" |
| SCNi32 | "i" |
| SCNi64 | "lli" |
| SCNo8 | "hho" |
| SCNo16 | "ho" |
| SCNo32 | "o" |
| SCNo64 | "llo" |
| SCNu8 | "hhu" |
| SCNu16 | "hu" |
| SCNu32 | "u" |
| SCNu64 | "llu" |
| SCNx8 | "hhx" |
| SCNx16 | "hx" |
| SCNx32 | "x" |
| SCNx64 | "llx" |

---

## 左值与右值

> 简要来说，左值即为代码执行到下一行还可以访问到的值。

```cpp
int n_var = 10;         // ok
int n_var_1 = n_var;    // ok
```

`10` 是字面常量，没有指定的内存地址，属于**右值**；`n_var` 具有具体的内存位置，属于**左值**。

```cpp
int *p_nvar = &n_var;   // ok
```

`&` 是取地址操作符，作用于左值 `n_var` 获得其内存地址。

```cpp
int *p_nvar1 = &10;     // 错误！10 是右值
```

### 引用与右值绑定

```cpp
int &r_nvar = n_var;    // ok，引用必须绑定左值
r_nvar++;               // ok
int &r_nvar1 = 10;      // 错误！不能将左值引用绑定到右值
const int &r_nvar2 = 10;// ok，const 左值引用可以绑定右值
```

### 自增操作符的返回值

```cpp
int n_var_2 = 0;
n_var2 = n_var_1++;     // ok，后置++返回右值
n_var2 = ++n_var_1;     // ok，前置++返回左值
// n_var2 = ++n_var++;  // 错误！后置++返回右值，不能再次++
n_var2 = (++n_var)++;   // ok，前置++返回左值
```

> 自增操作符的结合方向是从右至左。

### 函数返回值

```cpp
int func_1() { return 10; }
func_1() = 20;           // 错误！返回临时值（右值）

int global_nvar = 10;
int& func_2() { return global_nvar; }
func_2() = 20;           // ok，返回引用（左值）
```

---

## 位运算

> 按"位"进行，位之间不影响。

### 按位与、或、取反、异或

```cpp
int n_var1 = 3;     // 0...00000011
int n_var2 = 4;     // 0...00000100
int n_var3 = n_var1 & n_var2;   // 0...00000000
int n_var4 = n_var1 | n_var2;   // 0...00000111
int n_var5 = ~n_var1;           // 1...11111100（补码）-> -4
int n_var6 = n_var1 ^ n_var2;   // 0...00000111
```

### 取模与位运算等价转换

```cpp
int n_var = 15;
int n_var1 = n_var % 2;     // 等价于 n_var & 1
int n_var2 = n_var % 4;     // 等价于 n_var & 3
int n_var3 = n_var % 8;     // 等价于 n_var & 7
```

> 适用条件：模数是 2 的幂次方时，`n % (2^k)` 等价于 `n & ((2^k) - 1)`。

---

## 逻辑与（或）

### 短路特性

```cpp
int n_var1 = 0;
int n_var2 = 0;
(n_var1++) && (n_var2++);   // n_var1 = 1, n_var2 = 0（短路）
(n_var1++) || (n_var2++);   // n_var1 = 2, n_var2 = 0（短路）
```

### 优先级

`&&` 优先级高于 `||`：

```cpp
printf("1") || printf("2") && printf("3");    // 输出 1（&& 先结合）
(printf("1") || printf("2")) && printf("3");  // 输出 13
```

---

## 设置随机数

```cpp
#include <cstdlib>
#include <ctime>

srand(time(0));             // 设置随机种子
int rand_value = rand() % 100;  // 0~99 的随机数
```

---

## 头递归 & 尾递归

| 类型 | 特点 |
|------|------|
| **头递归** | 下一层调用返回后才完成本层计算 |
| **尾递归** | 下一层调用前先进行本层计算 |

```cpp
// 头递归：阶乘
int factorial_1(int n) {
    if (n == 1) return 1;
    return n * factorial_1(n - 1);
}

// 尾递归：阶乘（累积结果）
int factorial_2(int n, int result) {
    if (n == 0) return result;
    return factorial_2(n - 1, n * result);
}
```

---

## 函数地址做函数参数

```cpp
int func_1(int (*f)(int), int n) {
    return f(n);
}
// 调用：func_1(factorial_1, 5);
```

---

## continue & break

- **continue**：回到当前循环头部，进行下一次循环
- **break**：跳出当前所在循环

---

## 数组初始化

### memset

> 按字节分配，只能正确初始化 `0` 和 `-1`。

```cpp
int n_array[5];
memset(n_array, 0, sizeof(n_array));   // 正确，全部置 0
memset(n_array, -1, sizeof(n_array));  // 正确，全部置 -1
memset(n_array, 1, sizeof(n_array));   // 错误！实际为 0x01010101 = 16843009
```

### {} 初始化

与 `memset` 耗时差不多，但可能存在移植性问题。

---

## 折半查找

> 只适用于**顺序表**。

```cpp
int n_array[5] = {2, 4, 7, 9, 23};
int low = 0, high = 4, mid;
int n_search;
scanf("%d", &n_search);

while (low <= high) {
    mid = (low + high) / 2;
    if (n_array[mid] < n_search) {
        low = mid + 1;
    } else if (n_array[mid] > n_search) {
        high = mid - 1;
    } else {
        break;
    }
}
printf("位于第 %d 个\n", (low > high) ? 0 : (mid + 1));
```

---

## 排序

### 冒泡排序

> 稳定排序，时间复杂度 $O(n^2)$

```cpp
void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(&arr[j], &arr[j + 1]);
            }
        }
    }
}
```

### 选择排序

> 不稳定排序，时间复杂度 $O(n^2)$，交换次数 $O(n)$

```cpp
void selection_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        swap(&arr[i], &arr[min_idx]);
    }
}
```

> 冒泡排序和选择排序比较次数都是 $O(n^2)$，但交换次数前者是 $O(n^2)$，后者是 $O(n)$。

---

## 字符串字面量

- 是数组类型的（无名）**静态对象**
- 是**不可更改**的左值
- 可转换为指向第一个字符的指针
- 位于**字面量池**中

C/C++ 中字符串字面量的区别：

| 特性 | C | C++ |
|------|---|-----|
| const 限定 | 无 const | 有 const |
| 可修改性 | 可修改（未定义行为）| 不可修改 |

---

## 求质数

> 埃拉托斯特尼筛法

```cpp
int n_n = 100, n_m = 15;
int *p_mark_arr = (int*)malloc((n_n + 1) * sizeof(int));
memset(p_mark_arr, 0, (n_n + 1) * sizeof(int));  // 注意：sizeof(p_mark_arr) 是指针大小！
p_mark_arr[0] = p_mark_arr[1] = 1;  // 0 和 1 不是质数

for (int i = 2; i * i <= n_n; i++) {
    if (!p_mark_arr[i]) {
        for (int j = i * i; j <= n_n; j += i) {
            p_mark_arr[j] = 1;  // 标记为合数
        }
    }
}
// p_mark_arr[i] == 0 表示 i 是质数
```

---

## 指针大小

> 与机器字长相同：32 位系统为 4 字节，64 位系统为 8 字节。

```cpp
int *p_arr = (int*)malloc(4 * sizeof(int));
printf("%zu\n", sizeof(p_arr));     // 8（64位系统），不是 16！
memset(p_arr, 0, 4 * sizeof(int));   // 正确
// memset(p_arr, 0, sizeof(p_arr));  // 错误！只清零 8 字节
```

---

## 二维数组创建

### 方法一：二级指针

```cpp
int n = 5;
int **arr = (int**)malloc(n * sizeof(int*));
for (int i = 0; i < n; i++) {
    arr[i] = (int*)malloc(n * sizeof(int));
}
```

### 方法二：数组指针

```cpp
int n = 5;
int (*arr)[5] = (int(*)[5])malloc(n * 5 * sizeof(int));
memset(arr, 0, 5 * n * sizeof(int));
```

### 方法三：一级指针（模拟二维）

```cpp
int n = 5;
int *arr = (int*)malloc(n * n * sizeof(int));
memset(arr, 0, n * n * sizeof(int));
// 访问：arr[i * n + j]
```

---

## 矩阵旋转 & 螺旋输出

```cpp
// 矩阵旋转 90 度
void matrix_rotate(int **arr, int n) {
    // 新矩阵 new_arr[j][n-i-1] = arr[i][j]
    for (int i = 0; i < n; i++) {
        for (int j = n - 1; j >= 0; j--) {
            printf("%d ", arr[j][i]);
        }
        printf("\n");
    }
}
```

---

## sprintf 使用注意

> 被 `sprintf()` 写入的字符串数组长度不足会引起**缓冲区溢出/段错误**。

```cpp
char information[100];
char *name = "Li Ming";
char *gender = "male";
sprintf(information, "%s is a %s.", name, gender);
```

---

## malloc & calloc

| 函数 | 特点 |
|------|------|
| `malloc` | 分配未初始化的内存 |
| `calloc` | 分配并初始化为 0 的内存 |

---

## void & int

```cpp
void *p_var;
int n_var = 0;
int *p_nvar = &n_var;
p_var = p_nvar;                 // ok，void* 可接受任何指针
p_nvar = (int*)p_var;           // 需要强制转换
```

---

## 结构体

### 内存对齐规则

1. 结构体变量中成员的偏移量必须是成员大小的整数倍
2. 结构体大小必须是最大成员大小的整数倍
3. 嵌套结构体的第一个成员偏移量是外层成员中最大对齐数的整数倍
4. 对齐方式可通过 `#pragma pack(n)` 修改

```cpp
typedef struct test_struct1 {
    int n_var;      // 4
    char* str;      // 8（64位）
    float f_var;    // 4
} Test_struct1;     // 大小 = 24（对齐到 8）

typedef struct test_struct2 {
    char* str;      // 8
    int n_var;      // 4
    float f_var;    // 4
} Test_struct2;     // 大小 = 16
```

### 求偏移量

```cpp
#include <stddef.h>

size_t off1 = offsetof(Test_struct3, ch1);   // 0
size_t off2 = offsetof(Test_struct3, ss);    // 8
size_t off3 = offsetof(Test_struct3, f_var); // 24
```

> `offsetof(s, m)` 宏：`((size_t)&(((s*)0)->m))`

### 位域

```cpp
typedef struct test_struct {
    char ch1:4;     // 占 4 位
    char ch2:3;     // 占 3 位
    char ch3:2;     // 占 2 位，需要新字节
} Test_struct;      // 大小 = 2
```

> 同一类型连续位域，若总位宽不超过类型存储单元则连续存放；否则在新单元存储。

---

## 共用体

> 共用体内成员变量**共用一个内存空间**，大小等于最长成员的内存长度。

```cpp
typedef union test_union {
    char ch1;
    short s_var;
    int n_var;
} Test_union;

Test_union test_1;
test_1.n_var = 0x0f0f0f0f;
printf("%d %d %d\n", test_1.ch1, test_1.s_var, test_1.n_var);
// 输出：15 3855 252645135（小端字节序）
```

---

## 枚举

```cpp
enum test_enum {
    SUNDAY,     // 0
    MONDAY      // 1
} test_date;
test_date = MONDAY;
printf("%d\n", test_date);   // 1
```

---

## 约瑟夫环

> N 个人围成圆圈，从第 K 个人开始报数，数到 M 的人出列，重复直到所有人出列。

```cpp
typedef struct node {
    int data;
    struct node *next;
} Node;

Node *circle_create(int n) {
    Node *temp = (Node *)malloc(sizeof(Node));
    Node *head = temp;
    head->data = 1;
    for (int i = 2; i <= n; i++) {
        Node *new_node = (Node *)malloc(sizeof(Node));
        new_node->data = i;
        temp->next = new_node;
        temp = new_node;
    }
    temp->next = head;  // 构成循环链表
    return head;
}

void count_off(Node *head, int n, int k, int m) {
    Node *p = head, *q = head;
    // 移动到第 k-1 个位置
    for (int count = 1; count < k - 1; count++) {
        q = q->next;
    }
    p = q->next;
    while (p != p->next) {
        for (int count = 1; count < m; count++) {
            q = p;
            p = p->next;
        }
        printf("%d ", p->data);
        q->next = p->next;
        free(p);
        p = q->next;
    }
    printf("%d\n", p->data);
    free(p);
}
```
