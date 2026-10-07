#include "../include/truth_table.h"

#include <algorithm>
#include <iomanip>
#include <iostream>


// ============================================================
// constructor
// ============================================================

truth_table::truth_table(
    const boolean_function& function
)
    : function(function)
{
}


// ============================================================
// generate
// ============================================================

std::vector<truth_table_row>
truth_table::generate(
    const expression& minimized
) const
{
    std::vector<truth_table_row> rows;

    unsigned long long total_rows =
        row_count();

    for (unsigned long long row = 0;
         row < total_rows;
         ++row)
    {
        std::vector<int> input =
            row_to_input(row);

        bool original =
            evaluate_original(input);

        bool minimized_output =
            evaluate_minimized(
                minimized,
                input
            );

        truth_table_row current;

        current.input = input;
        current.original_output = original;
        current.minimized_output = minimized_output;

        rows.push_back(current);
    }

    return rows;
}


// ============================================================
// evaluate original
// ============================================================

bool truth_table::evaluate_original(
    const std::vector<int>& input
) const
{
    // The input must have the same number of
    // variables as the Boolean function.

    if (input.size() !=
        static_cast<size_t>(
            function.variable_count
        ))
    {
        return false;
    }

    // Convert binary input to decimal minterm.
    //
    // Example:
    //
    // {0,1,0,1}
    //
    // = 0101
    // = 5

    unsigned int minterm = 0;

    for (int bit : input)
    {
        minterm =
            (minterm << 1) |
            static_cast<unsigned int>(bit);
    }

    // If the minterm is in the ON-set,
    // F = 1.

    return std::find(
        function.minterms.begin(),
        function.minterms.end(),
        minterm
    ) != function.minterms.end();
}


// ============================================================
// evaluate minimized
// ============================================================

bool truth_table::evaluate_minimized(
    const expression& minimized,
    const std::vector<int>& input
) const
{
    return minimized.evaluate(input);
}


// ============================================================
// verify
// ============================================================

bool truth_table::verify(
    const expression& minimized
) const
{
    unsigned long long total_rows =
        row_count();

    for (unsigned long long row = 0;
         row < total_rows;
         ++row)
    {
        std::vector<int> input =
            row_to_input(row);

        bool original =
            evaluate_original(input);

        bool optimized =
            evaluate_minimized(
                minimized,
                input
            );

        if (original != optimized)
        {
            return false;
        }
    }

    return true;
}


// ============================================================
// print
// ============================================================

void truth_table::print(
    const expression& minimized
) const
{
    std::vector<truth_table_row> rows =
        generate(minimized);

    // --------------------------------------------------------
    // Header
    // --------------------------------------------------------

    for (int i = 0;
         i < function.variable_count;
         ++i)
    {
        char variable =
            static_cast<char>('A' + i);

        std::cout
            << variable
            << " ";
    }

    std::cout
        << "| Original | Minimized"
        << "\n";

    // Separator

    for (int i = 0;
         i < function.variable_count;
         ++i)
    {
        std::cout
            << "--";
    }

    std::cout
        << "+----------+----------"
        << "\n";

    // --------------------------------------------------------
    // Rows
    // --------------------------------------------------------

    for (const truth_table_row& row : rows)
    {
        for (int bit : row.input)
        {
            std::cout
                << bit
                << " ";
        }

        std::cout
            << "| "
            << row.original_output
            << "        "
            << "| "
            << row.minimized_output
            << "\n";
    }
}


// ============================================================
// print mismatches
// ============================================================

void truth_table::print_mismatches(
    const expression& minimized
) const
{
    bool found_mismatch = false;

    unsigned long long total_rows =
        row_count();

    for (unsigned long long row = 0;
         row < total_rows;
         ++row)
    {
        std::vector<int> input =
            row_to_input(row);

        bool original =
            evaluate_original(input);

        bool optimized =
            evaluate_minimized(
                minimized,
                input
            );

        if (original != optimized)
        {
            found_mismatch = true;

            for (int bit : input)
            {
                std::cout
                    << bit
                    << " ";
            }

            std::cout
                << "| Original = "
                << original
                << " | Minimized = "
                << optimized
                << "\n";
        }
    }

    if (!found_mismatch)
    {
        std::cout
            << "No mismatches found.\n";
    }
}


// ============================================================
// row count
// ============================================================

unsigned long long truth_table::row_count() const
{
    return 1ULL <<
        function.variable_count;
}


// ============================================================
// row -> input
// ============================================================

std::vector<int>
truth_table::row_to_input(
    unsigned long long row
) const
{
    std::vector<int> input;

    input.reserve(
        function.variable_count
    );

    for (int i =
             function.variable_count - 1;
         i >= 0;
         --i)
    {
        int bit =
            static_cast<int>(
                (row >> i) & 1ULL
            );

        input.push_back(bit);
    }

    return input;
}
