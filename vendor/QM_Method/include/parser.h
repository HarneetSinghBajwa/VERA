#ifndef PARSER_H
#define PARSER_H

#include <string>
#include <vector>


// ============================================================
// Boolean function input
// ============================================================
//
// This structure stores the function in a form that the rest
// of the program can use without caring how the user entered it.
//
// Example:
//
// F(A,B,C,D) = Σm(0,1,2,5) + Σd(3,7)
//
// becomes:
//
// variable_count = 4
// minterms       = {0,1,2,5}
// dont_cares     = {3,7}
//

struct boolean_function
{
    int variable_count;

    std::vector<unsigned int> minterms;

    std::vector<unsigned int> dont_cares;
};


// ============================================================
// parser
// ============================================================

class parser
{
public:

    // ========================================================
    // interactive input
    // ========================================================

    // Ask the user for the number of variables,
    // minterms and don't-cares.

    static boolean_function
    interactive_input();


    // ========================================================
    // mathematical notation
    // ========================================================

    // Parse expressions such as:
    //
    // F(A,B,C,D) = Σm(0,1,2,5) + Σd(3,7)
    //
    // or:
    //
    // F(A,B,C,D) = m(0,1,2,5) + d(3,7)
    //
    // or:
    //
    // m(0,1,2,5) d(3,7)

    static boolean_function
    parse_function(
        const std::string& input
    );


    // ========================================================
    // minterm parsing
    // ========================================================

    // Parse a list of integers.
    //
    // Example:
    //
    // "0 1 2 5 7"
    //
    // becomes:
    //
    // {0,1,2,5,7}

    static std::vector<unsigned int>
    parse_number_list(
        const std::string& input
    );


    // Parse numbers inside parentheses.
    //
    // Example:
    //
    // "m(0,1,2,5)"
    //
    // becomes:
    //
    // {0,1,2,5}

    static std::vector<unsigned int>
    parse_parenthesized_numbers(
        const std::string& input
    );


    // ========================================================
    // validation
    // ========================================================

    // Check whether a Boolean function is valid.

    static bool
    validate(
        const boolean_function& function,
        std::string& error_message
    );


    // Check whether a minterm can exist for the
    // specified number of variables.
    //
    // For n variables:
    //
    // valid range = 0 ... 2^n - 1

    static bool
    valid_minterm(
        unsigned int minterm,
        int variable_count
    );


    // ========================================================
    // utility
    // ========================================================

    // Remove duplicate minterms.

    static void
    remove_duplicates(
        std::vector<unsigned int>& values
    );


    // Sort minterms in ascending order.

    static void
    sort_minterms(
        std::vector<unsigned int>& values
    );


    // Remove don't-care terms that also appear
    // in the ON-set.
    //
    // Actual minterms always take priority.

    static void
    resolve_overlap(
        boolean_function& function
    );
};

#endif

