#ifndef TRUTH_TABLE_H
#define TRUTH_TABLE_H

#include "expression.h"
#include "parser.h"

#include <string>
#include <vector>


// ============================================================
// truth table row
// ============================================================
//
// Example for:
//
// F(A,B,C) = Σm(1,3,5)
//
// A B C | F
// -------
// 0 0 0 | 0
// 0 0 1 | 1
//
// Each row stores the input combination and the expected
// value of the original Boolean function.
//

struct truth_table_row
{
    std::vector<int> input;

    bool original_output;

    bool minimized_output;
};


// ============================================================
// truth table
// ============================================================

class truth_table
{
private:

    // Original Boolean function.

    boolean_function function;


public:

    // ========================================================
    // constructor
    // ========================================================

    explicit truth_table(
        const boolean_function& function
    );


    // ========================================================
    // generation
    // ========================================================

    // Generate all possible input combinations.
    //
    // For n variables:
    //
    // 2^n rows are generated.

    std::vector<truth_table_row>
    generate(
        const expression& minimized
    ) const;


    // ========================================================
    // evaluation
    // ========================================================

    // Evaluate the ORIGINAL Boolean function
    // for a particular input.

    bool evaluate_original(
        const std::vector<int>& input
    ) const;


    // Evaluate the MINIMIZED expression.

    bool evaluate_minimized(
        const expression& minimized,
        const std::vector<int>& input
    ) const;


    // ========================================================
    // verification
    // ========================================================

    // Compare the original function and minimized
    // expression for every possible input.
    //
    // Returns true if they are completely equivalent.

    bool verify(
        const expression& minimized
    ) const;


    // ========================================================
    // output
    // ========================================================

    // Print the complete truth table.

    void print(
        const expression& minimized
    ) const;


    // Print only rows where the original and minimized
    // functions disagree.
    //
    // Useful when debugging the QM implementation.

    void print_mismatches(
        const expression& minimized
    ) const;


    // ========================================================
    // utility
    // ========================================================

    // Number of rows in the truth table.
    //
    // For n variables:
    //
    // 2^n

    unsigned long long row_count() const;


    // Return the input combination represented by
    // a row number.
    //
    // Example:
    //
    // n = 4
    // row = 5
    //
    // returns:
    //
    // {0,1,0,1}

    std::vector<int>
    row_to_input(
        unsigned long long row
    ) const;
};

#endif
