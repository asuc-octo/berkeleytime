# Berkeleytime Logical Language (BtLL)

Berkeleytime Logical Language (BtLL) is a new interpreted programming language designed for logical operations and data manipulation. It features a simple, type-safe syntax with support for functions, lists, and various built-in operations.

## Overview

BtLL is a statically-typed, interpreted language that emphasizes clarity and type safety. Programs are executed by defining functions and calling them, with a special `main` function serving as the entry point.

BtLL is built upon Typescript, ensuring strong compatability with Typescript types and objects.

## Basic Syntax

### Type System

BtLL supports several built-in types:

- **Primitive Types**: `boolean`, `number`, `string`
- **Collection Types**: `List<T>` (e.g., `List<number>`, `List<string>`)
- **Function Types**: `Function<ReturnType>(ArgType1, ArgType2, ...)`
- **Object Types**: `Plan`, `Column`, `Course`, `Requirement`, `Label`

### Variable Declarations

Variables are declared with their type, name, and value:

```
type variable_name expression
```

Examples:
```
boolean is_valid true
number count 42
string greeting "Hello, World!"
List<number> numbers [1, 2, 3, 4, 5]
```

### Function Definitions

Functions are defined with their return type, parameter types, name, and body:

```
Function<ReturnType>(ParamType1, ParamType2, ...) function_name (param1, param2, ...) {
    // function body
    type return expression
}
```

Example:
```
Function<number>(number) times_three (a) {
    number return add([a, a, a])
}
```

### Function Calls

Functions are called using the syntax:

```
function_name(arg1, arg2, ...)
```

For functions with generic type parameters:

```
function_name<Type>(arg1, arg2, ...)
```

### Lists

Lists are created using square brackets:

```
List<number> my_list [1, 2, 3]
List<string> words ["hello", "world"]
```

Lists can contain variables and expressions:

```
List<boolean> results [x, y, or([x, y])]
```

### Comments

Single-line comments start with `//`:

```
// This is a comment
boolean x true  // Inline comment
```

### Return Statements

Functions return values using the `return` keyword:

```
type return expression
```

Example:
```
boolean return and([result_1, result_2])
```

### Program Structure

Every BtLL program must have a `main` function that serves as the entry point:

```
Function<ReturnType>() main () {
    // program code
    type return expression
}
```

## Built-in Functions

BtLL provides a rich set of built-in functions organized by category:

- **Logic Functions**: `and`, `or`, `not`, `equal`, etc.
- **List Functions**: `filter`, `find`, `reduce`, `map`, `contains`, `get_element`, `length`, etc.
- **Number Functions**: `add`, `subtract`, `multiply`, `divide`, etc.
- **String Functions**: Various string manipulation operations
- **Object Functions**: Functions for working with `Plan`, `Column`, `Course`, and `Requirement` objects

## Requirement Types

BtLL includes a specialized type system for representing academic requirements. All requirement types extend a base `Requirement` type and automatically compute their `result` field based on their specific logic.

### Base Requirement Type

The base `Requirement` type contains three fields that all requirement types inherit:

| Field | Type | Description |
|-------|------|-------------|
| `result` | `boolean` | Whether the requirement is satisfied |
| `description` | `string` | Human-readable description of the requirement |
| `type` | `string` | The specific requirement type name |

```
Requirement req (true, "Example requirement")
```

### Extended Requirement Types

BtLL provides six specialized requirement types that extend the base `Requirement`:

#### BooleanRequirement

A simple requirement based on a boolean value. The `result` is set directly from the `value` field.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `value` | `boolean` | The boolean value determining if the requirement is met |

```
BooleanRequirement req BooleanRequirement(is_satisfied, "Must complete orientation")
```

#### NCoursesRequirement

A requirement that is satisfied when a minimum number of courses are completed. The `result` is `true` when `length(courses) >= required_count`.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `courses` | `List<Course>` | List of courses that count toward this requirement |
| `required_count` | `number` | Minimum number of courses required |

```
NCoursesRequirement req NCoursesRequirement(matching_courses, 3, "Complete 3 breadth courses")
```

#### CourseListRequirement

A requirement for completing a specific list of courses. The `result` is `true` when all entries in `met_status` are `true`.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `required_courses` | `List<Course>` | The specific courses required |
| `met_status` | `List<boolean>` | Completion status for each required course |

```
CourseListRequirement req CourseListRequirement(required, status_list, "Complete core courses")
```

#### AndRequirement

A composite requirement that is satisfied when ALL sub-requirements are met. The `result` is `true` when every requirement in the list has `result == true`.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `requirements` | `List<Requirement>` | List of requirements that must all be satisfied |

```
AndRequirement req AndRequirement([req1, req2, req3], "Complete all of the following")
```

#### OrRequirement

A composite requirement that is satisfied when ANY sub-requirement is met. The `result` is `true` when at least one requirement in the list has `result == true`.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `requirements` | `List<Requirement>` | List of requirements where at least one must be satisfied |

```
OrRequirement req OrRequirement([option_a, option_b], "Complete one of the following")
```

#### NumberRequirement

A requirement comparing numeric values. The `result` is `true` when `actual >= required`.

| Additional Field | Type | Description |
|------------------|------|-------------|
| `actual` | `number` | The current value (e.g., units completed) |
| `required` | `number` | The minimum required value |

```
NumberRequirement req NumberRequirement(total_units, 120, "Complete 120 units")
```

### Accessing Requirement Fields

All requirement fields can be accessed using the `get_attr` function:

```
boolean is_met get_attr(my_requirement, "result")
string desc get_attr(my_requirement, "description")
number needed get_attr(unit_req, "required")
```

## Example Program

Here's a complete example demonstrating BtLL syntax:

```
Function<boolean>(number) is_even (n) {
    number remainder mod(n, 2)
    boolean return equal([remainder, 0])
}

Function<number>(number, number) add_numbers (acc, n) {
    number return add([acc, n])
}

Function<boolean>() main () {
    List<number> numbers [1, 2, 3, 4, 5, 6, 7, 8]
    List<number> evens filter(numbers, is_even)
    number sum reduce(evens, add_numbers, 0)
    boolean return equal([sum, 20])
}
```

## Next Steps

The following features are planned for future releases:

- **Verbosity Fixes**: The language is unnecessarily verbose in a handful of places
- **Performance Improvements**: Decrease checks to optimize performance

## Getting Started

To use BtLL in your project, import the interpreter:

```typescript
import { init } from "@repo/BtLL";

const code = `
Function<number>() main () {
    number result add([1, 2, 3])
    number return result
}
`;

const result = init(code);
console.log(result); // 6
```
A value of any type can be returned by the main function.

