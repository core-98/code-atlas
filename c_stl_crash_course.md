# C++ & STL Crash Course

Your fast‑track guide to modern C++ (C++17/20) and the Standard Template Library. Designed for quick ramp‑up with focused lessons, runnable snippets, and targeted exercises.

---

## 0) How to Use This Guide
- Each section has **Core Ideas → Examples → Pitfalls → Exercises**.
- Code targets **C++20**. If you use older compilers, note the portability tips.
- Suggested pace: 7–10 focused sessions (~60–90 mins each) + a mini‑project.

---

## 1) Setup & Tooling
**Core Ideas**
- Install a recent compiler: **gcc ≥ 12**, **clang ≥ 15**, or **MSVC VS2022**.
- Build tools: `g++ -std=c++20 -O2 -Wall -Wextra -pedantic main.cpp -o app`.
- Use a package manager (vcpkg/conan) for libraries.
- IDEs: VSCode (C/C++ Extension), CLion, Visual Studio. Enable warnings + static analysis.

**Example**
```bash
# Linux/macOS
clang++ -std=c++20 -O2 -Wall -Wextra hello.cpp -o hello
./hello
```

**Pitfalls**
- Mixing old C++ headers (`<stdio.h>`) with modern C++ idioms.
- Compiling without warnings or with inconsistent standards.

**Exercises**
1) Set up your toolchain and compile a “Hello, {name}”.
2) Turn on `-fsanitize=address,undefined` for a small program and observe reports.

---

## 2) Language Basics
**Core Ideas**
- **Types**: `int`, `double`, `bool`, `char`, `auto` for type deduction.
- **Control flow**: `if`, `switch`, loops (`for`, range‑for), `break/continue`.
- **Functions**: pass‑by‑value/reference, default args, overloading.
- **Namespaces** and headers.

**Example**
```cpp
#include <bits/stdc++.h> // or include what you use in production
using namespace std;

int add(int a, int b) { return a + b; }

int main() {
    vector<int> v = {1,2,3};
    int sum = 0;
    for (int x : v) sum += x;
    cout << add(sum, 10) << "\n";
}
```

**Pitfalls**
- Overusing `using namespace std;` in headers (ok in short demos; avoid in libs).
- Integer overflow; prefer `std::int64_t` when ranges are large.

**Exercises**
- Implement `pow_int(base, exp)` by repeated squaring.

---

## 3) Pointers, References, RAII & `const`
**Core Ideas**
- **Reference (`T&`)** vs **pointer (`T*`)**; `const` correctness (`const T*`, `T* const`).
- RAII: resources are tied to object lifetime; prefer stack objects.
- Use **smart pointers** when ownership is dynamic: `unique_ptr`, `shared_ptr`, `weak_ptr`.

**Example**
```cpp
struct File { FILE* f{}; File(const char* p){ f=fopen(p,"r"); } ~File(){ if(f) fclose(f); } };
```

**Pitfalls**
- Dangling references; double frees; forgetting virtual destructor in base types.

**Exercises**
- Write a simple `ScopeGuard` that runs a lambda in its destructor.

---

## 4) Classes, Structs, Rule of Zero/Three/Five
**Core Ideas**
- Defaulted/Deleted special members, constructors, `=default`, `=delete`.
- **Rule of Zero**: prefer types that don’t manage resources directly.
- `explicit` constructors; `=0` pure virtual functions.

**Example**
```cpp
struct Point {
  int x{}, y{};
  friend ostream& operator<<(ostream& os, const Point& p){ return os<<p.x<<","<<p.y; }
};
```

**Exercises**
- Implement an immutable `StringView`‑like wrapper over `std::string` (no owning).

---

## 5) Value Categories, Move Semantics & Perfect Forwarding
**Core Ideas**
- lvalues vs rvalues; `T&&`; move ctor/assign; `std::move` and `std::forward`.
- Avoid copying large containers by returning by value (NRVO + moves are cheap).

**Example**
```cpp
vector<int> make_vec(){ vector<int> v(1'000'000, 1); return v; } // NRVO
```

**Exercises**
- Add move operations to a small `Buffer` struct; benchmark copy vs move.

---

## 6) Templates & Generic Programming
**Core Ideas**
- Function/class templates; partial/explicit specialization; constraints with `requires`.
- Type traits: `std::enable_if`, `std::is_integral`, concepts in C++20.

**Example**
```cpp
#include <concepts>
template <std::integral I> I gcd(I a, I b){ while(b){ auto t=a%b; a=b; b=t; } return a; }
```

**Exercises**
- Write a `minmax` template returning `std::pair<T,T>`; constrain to `std::totally_ordered`.

---

## 7) Standard Library: Overview
- **Containers**: sequence (`vector`, `array`, `deque`, `list`, `forward_list`) and associative (`set`, `map`, `unordered_set`, `unordered_map`) + adapters (`stack`, `queue`, `priority_queue`).
- **Algorithms**: `<algorithm>`: `sort`, `find`, `accumulate`, `transform`, `lower_bound`, `unique`, etc.
- **Iterators**: input/output, forward, bidirectional, random‑access.
- **Ranges (C++20)**: `views::filter/transform`, pipelines, `ranges::` algorithms.

---

## 8) Containers in Practice
**vector** (default go‑to)
```cpp
vector<int> v = {5,1,3}; sort(v.begin(), v.end());
```
**deque** (fast push_front/back; random access)
**list/forward_list** (rare; when many splices/iter stability required)
**array<N>** (fixed size on stack)
**set/map** (ordered, log N)
**unordered_set/map** (hash‑based, avg O(1))

**Pitfalls**
- Invalidated iterators after reallocation (`vector::push_back` may reallocate).
- `unordered_*` needs good hash; custom types require `==` and `hash`.

**Exercises**
- Given `n` numbers, print unique values in sorted order (try both `set` and `unordered_set` + `vector`+`sort`).

---

## 9) Algorithms & Idioms
**Core Ideas**
- Prefer algorithms to hand‑written loops.
- `std::sort`, `std::stable_sort`, `std::partial_sort`, `nth_element`.
- `accumulate`, `reduce` (parallel), `transform`, `remove_if`/erase‑remove idiom.

**Examples**
```cpp
vector<int> v = {1,2,3,4,5};
int s = accumulate(v.begin(), v.end(), 0);
v.erase(remove_if(v.begin(), v.end(), [](int x){return x%2==0;}), v.end());
```

**Exercises**
- Use `nth_element` to find the median in O(n) average time.

---

## 10) Iterators & Ranges (C++20)
**Core Ideas**
- Ranges algorithms (`std::ranges::sort`) and views pipelines.

**Example**
```cpp
#include <ranges>
vector<int> v = {1,2,3,4,5};
for (int x : v | views::filter([](int x){return x%2;}) | views::transform([](int x){return x*x;}))
    cout << x << ' ';
```

**Exercise**
- Pipeline to read words, lowercase them, remove stopwords, and count frequency.

---

## 11) Strings & String Views
**Core Ideas**
- `std::string`, `std::string_view` (non‑owning), `std::stringstream`.

**Example**
```cpp
string_view sv = "abcdef";
auto sub = sv.substr(2,3); // "cde"
```

**Pitfalls**
- Don’t store `string_view` to a temporary `string`.

---

## 12) Error Handling & Exceptions
**Core Ideas**
- Exceptions for exceptional cases; RAII makes unwinding safe.
- Alternatives: `std::optional`, `std::expected` (if available), status codes.

**Example**
```cpp
int parse_positive(string_view s){
  size_t pos{}; int v = stoi(string(s), &pos); if (v<=0 || pos!=s.size()) throw runtime_error("bad"); return v;
}
```

---

## 13) I/O, Filesystem & Formatting
**Core Ideas**
- `<iostream>`, `<fstream>`, `<filesystem>`, `<format>` (C++20), `<chrono>`.

**Examples**
```cpp
#include <format>
cout << std::format("Hello {}!", "World");
```
```cpp
#include <filesystem>
for (auto& p : std::filesystem::directory_iterator(".")) cout << p.path() << '\n';
```

**Exercise**
- Walk a directory and sum sizes by file extension.

---

## 14) Concurrency (Intro)
**Core Ideas**
- Threads, mutexes, locks, futures, async; `std::jthread` (C++20) with stop tokens.

**Example**
```cpp
#include <thread>
#include <mutex>
mutex m; int cnt=0;
void work(){ for(int i=0;i<100000;i++){ lock_guard<mutex> lg(m); ++cnt; } }
int main(){ thread t1(work), t2(work); t1.join(); t2.join(); cout<<cnt; }
```

**Exercise**
- Implement a thread‑safe concurrent queue with condition variable.

---

## 15) Smart Pointers & Ownership Patterns
- `unique_ptr` for exclusive ownership; `make_unique`.
- `shared_ptr` for shared ownership; avoid cycles (use `weak_ptr`).
- Don’t use smart pointers for everything—prefer values/reference semantics.

**Exercise**
- Build a tree of nodes with `unique_ptr` children; implement DFS.

---

## 16) Memory Model & Performance
- Layout: PODs, padding, `sizeof`, alignment.
- Avoid premature optimization; measure.
- Reserve capacity (`v.reserve(n)`), `shrink_to_fit()` carefully.
- Small Object Optimization (SOO) awareness in `std::string` (impl‑defined).

**Exercise**
- Benchmark `vector` push_back with and without `reserve`.

---

## 17) STL Cheatsheet (Quick Reference)
**Containers**
- `vector<T>` — dynamic array; random access; amortized O(1) push_back.
- `deque<T>` — fast push_front/back; stable refs across middle insertions.
- `list<T>` — doubly‑linked; stable iterators; poor cache locality.
- `set<T>/map<K,V>` — ordered tree; log N ops; supports `lower_bound`.
- `unordered_set<T>/unordered_map<K,V>` — average O(1) lookups; need hash.
- `priority_queue<T>` — binary heap; top, push, pop are O(log N).

**Algorithms** (non‑exhaustive)
- Search: `find`, `binary_search`, `lower_bound/upper_bound`, `equal_range`
- Reorder: `sort`, `stable_sort`, `partial_sort`, `nth_element`, `rotate`, `shuffle`
- Modify: `copy`, `move`, `transform`, `fill`, `generate`, `remove_if` (erase‑remove)
- Numeric: `accumulate`, `inner_product`, `iota`, `exclusive_scan` (C++17)

**Iterator Utilities**
- `back_inserter`, `istream_iterator`, `ostream_iterator`.

**Ranges**
- `views::iota`, `views::take`, `views::drop`, `views::filter`, `views::transform`.

---

## 18) Competitive Programming STL Patterns (Optional)
- Fast IO: `ios::sync_with_stdio(false); cin.tie(nullptr);`
- `vector<vector<int>> g(n);` adjacency lists.
- Custom hashes for pair/tuple.
- DSU/Union‑Find, coordinate compression, sliding window, two‑pointer.

**Template Snippet**
```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main(){ ios::sync_with_stdio(false); cin.tie(nullptr);
  int T; if(!(cin>>T)) return 0; while(T--){ /* solve */ }
}
```

---

## 19) Mini‑Project Ideas
1) **CSV Analyzer**: read CSV, compute stats, group by column (use `ranges` & `format`).
2) **Task CLI**: add/list/complete tasks; persist to JSON (nlohmann/json or `std::fstream`).
3) **Word Count**: parallel word counter with `jthread` & `unordered_map`.

---

## 20) Practice Problems (with Hints)
1) **Two Sum Variants** (array + target): hash map; then two‑pointers on sorted.
2) **Intervals Merge**: sort by start; merge if `cur.end >= next.start`.
3) **Top‑K Frequent**: `unordered_map` + `partial_sort` / heap.
4) **Median of Stream**: two heaps.
5) **LRU Cache**: `list` + `unordered_map`.

*Solutions sketch at the bottom.*

---

## 21) Testing & Debugging
- Assertions: `assert` / `<cassert>`; property‑based (rapidcheck/approvaltests).
- Sanitizers: ASan, UBSan, TSan; Valgrind on Linux.
- Logging: `cerr`, or libraries (spdlog) if allowed.

---

## 22) Style Guide Lite
- Prefer **`#include` what you use**.
- Avoid raw loops when an algorithm exists.
- Keep functions short, pure when possible.
- Name ownership semantics clearly: `get_ptr()` vs `get_ref()`.

---

## 23) Portability & Build Notes
- Windows: `_setmode(_fileno(stdout), _O_U8TEXT)` for wide output (optional).
- MinGW vs MSVC quirks; prefer CMake for cross‑platform builds.
- Enable `-fno-exceptions` only if you know all tradeoffs.

---

## 24) Reading List (Optional, Non‑normative)
- “A Tour of C++” (Stroustrup), “Effective Modern C++” (Meyers), “CppCoreGuidelines”.

---

## 25) Solutions Sketches (selected)
**Two Sum**
```cpp
vector<int> two_sum(const vector<int>& a, int target){
  unordered_map<int,int> idx; // val -> index
  for(int i=0;i<(int)a.size();++i){
    if(auto it = idx.find(target - a[i]); it!=idx.end()) return {it->second, i};
    idx[a[i]] = i;
  }
  return {};
}
```

**Median of Stream**
```cpp
priority_queue<int> lo; // max-heap
priority_queue<int, vector<int>, greater<int>> hi; // min-heap
void add(int x){ if(lo.empty() || x<=lo.top()) lo.push(x); else hi.push(x);
  if(lo.size()>hi.size()+1){ hi.push(lo.top()); lo.pop(); }
  else if(hi.size()>lo.size()){ lo.push(hi.top()); hi.pop(); }
}
double median(){ if(lo.size()==hi.size()) return (lo.top()+hi.top())/2.0; return lo.top(); }
```

**Erase‑Remove Idiom**
```cpp
v.erase(remove_if(v.begin(), v.end(), pred), v.end());
```

---

## 26) 10‑Day Plan
1) Setup, syntax refresh, types
2) Functions, references, const
3) Classes, RAII, rule of zero
4) Move semantics, smart pointers
5) Templates & concepts
6) Containers tour
7) Algorithms & iterators
8) Ranges & string handling
9) Filesystem/format/chrono
10) Concurrency + mini‑project kickoff

---

## 27) Checklist
- [ ] Toolchain configured (C++20, warnings, ASan/UBSan)
- [ ] Comfortable with ownership & RAII
- [ ] Can pick the right STL container
- [ ] Use algorithms/ranges by default
- [ ] Can parse files, format output
- [ ] Wrote and tested a mini‑project

---

### Notes
- Replace `<bits/stdc++.h>` with precise headers in production.
- If targeting embedded/old platforms, adjust features accordingly.

