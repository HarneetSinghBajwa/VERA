#ifndef PRINTER_H
#define PRINTER_H

#include "implicant.h"
#include "petrick.h"
#include "quine_mccluskey.h"
#include "truth_table.h"

#include <set>
#include <string>
#include <vector>


class printer
{
public:

    // ========================================================
    // general
    // ========================================================

    // Print the program title.

    static void print_banner();


    // Print a horizontal separator.

    static void print_separator(
        char character = '-',
        int width = 60
    );


    // ========================================================
    // input
    // ========================================================

    // Print the Boolean function that was parsed.

    static void print_function(
        const boolean_function& function
    );


    // ========================================================
    // QM
    // ========================================================

    // Print a collection of implicants.

    static void print_implicants(
        const std::vector<implicant>& implicants,
        const std::string& title = "Implicants"
    );


    // Print one QM grouping round.

    static void print_groups(
        const quine_mccluskey::groups& groups,
        int round
    );


    // Print the result of a combination round.

    static void print_combination_round(
        const std::vector<implicant>& before,
        const std::vector<implicant>& after,
        int round
    );


    // Print all prime implicants with indices.
    //
    // Example:
    //
    // P0   00-1   A'B'D
    // P1   0-01   A'C'D
    // P2   -101   BC'D

    static void print_prime_implicants(
        const std::vector<implicant>& primes
    );


    // ========================================================
    // prime implicant chart
    // ========================================================

    // Print the complete prime implicant chart.

    static void print_prime_chart(
        const quine_mccluskey::prime_chart& chart,
        const std::vector<implicant>& primes
    );


    // Print essential prime implicants.

    static void print_essential_primes(
        const std::set<int>& essential,
        const std::vector<implicant>& primes
    );


    // ========================================================
    // Petrick
    // ========================================================

    // Print Petrick's expression.

    static void print_petrick_expression(
        const petrick::expression& expression,
        const std::vector<implicant>& primes
    );


    // Print the minimum products found by Petrick.

    static void print_petrick_solutions(
        const std::vector<petrick::product>& solutions,
        const std::vector<implicant>& primes
    );


    // ========================================================
    // final result
    // ========================================================

    // Print the minimized SOP.

    static void print_sop(
        const expression& minimized
    );


    // Print the minimized POS.

    static void print_pos(
        const std::string& pos
    );


    // Print optimization statistics.

    static void print_statistics(
        const expression& minimized
    );


    // ========================================================
    // verification
    // ========================================================

    // Print verification result.

    static void print_verification_result(
        bool passed
    );


    // Print complete truth table.

    static void print_truth_table(
        const truth_table& table,
        const expression& minimized
    );


    // Print only mismatching rows.

    static void print_mismatches(
        const truth_table& table,
        const expression& minimized
    );


    // ========================================================
    // complete report
    // ========================================================

    // Print a complete optimization report.

    static void print_complete_report(
        const boolean_function& function,
        const expression& sop,
        const std::string& pos,
        bool verification_passed
    );
};

#endif

