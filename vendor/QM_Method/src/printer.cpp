#include "../include/printer.h"

#include <iostream>
#include <sstream>
#include <iomanip>


// ============================================================
// general
// ============================================================

void printer::print_banner()
{
    std::cout << "\n";
    std::cout << "============================================\n";
    std::cout << "     QUINE-MCCLUSKEY BOOLEAN MINIMIZER\n";
    std::cout << "============================================\n";
    std::cout << "\n";
}


void printer::print_separator(
    char character,
    int width
)
{
    for (int i = 0; i < width; ++i)
    {
        std::cout << character;
    }

    std::cout << "\n";
}


// ============================================================
// input
// ============================================================

void printer::print_function(
    const boolean_function& function
)
{
    std::cout << "\n";
    std::cout << "Input Function\n";
    print_separator();

    std::cout
        << "Variables   : "
        << function.variable_count
        << "\n";

    std::cout
        << "Minterms    : ";

    for (size_t i = 0;
         i < function.minterms.size();
         ++i)
    {
        if (i > 0)
        {
            std::cout << ", ";
        }

        std::cout
            << function.minterms[i];
    }

    if (function.minterms.empty())
    {
        std::cout << "None";
    }

    std::cout << "\n";

    std::cout
        << "Don't cares : ";

    for (size_t i = 0;
         i < function.dont_cares.size();
         ++i)
    {
        if (i > 0)
        {
            std::cout << ", ";
        }

        std::cout
            << function.dont_cares[i];
    }

    if (function.dont_cares.empty())
    {
        std::cout << "None";
    }

    std::cout << "\n";
}


// ============================================================
// QM
// ============================================================

void printer::print_implicants(
    const std::vector<implicant>& implicants,
    const std::string& title
)
{
    std::cout << "\n";
    std::cout << title << "\n";
    print_separator();

    if (implicants.empty())
    {
        std::cout << "None\n";
        return;
    }

    for (size_t i = 0;
         i < implicants.size();
         ++i)
    {
        const implicant& current =
            implicants[i];

        std::cout
            << "P"
            << i
            << "   "
            << current.to_binary_string()
            << "   "
            << current.to_expression()
            << "   ";

        std::cout << "{";

        bool first = true;

        for (unsigned int minterm :
             current.get_covered_minterms())
        {
            if (!first)
            {
                std::cout << ", ";
            }

            std::cout
                << minterm;

            first = false;
        }

        std::cout << "}";

        std::cout << "\n";
    }
}


void printer::print_groups(
    const quine_mccluskey::groups& groups,
    int round
)
{
    std::cout << "\n";
    std::cout
        << "QM Round "
        << round
        << " - Groups\n";

    print_separator();

    for (const auto& group :
         groups)
    {
        std::cout
            << "Group "
            << group.first
            << ":\n";

        for (const implicant& current :
             group.second)
        {
            std::cout
                << "    "
                << current.to_binary_string()
                << "\n";
        }
    }
}


void printer::print_combination_round(
    const std::vector<implicant>& before,
    const std::vector<implicant>& after,
    int round
)
{
    std::cout << "\n";
    std::cout
        << "Combination Round "
        << round
        << "\n";

    print_separator();

    std::cout << "Input:\n";

    for (const implicant& current :
         before)
    {
        std::cout
            << "    "
            << current.to_binary_string()
            << "\n";
    }

    std::cout << "\n";

    std::cout << "Generated:\n";

    for (const implicant& current :
         after)
    {
        std::cout
            << "    "
            << current.to_binary_string()
            << "\n";
    }
}


void printer::print_prime_implicants(
    const std::vector<implicant>& primes
)
{
    std::cout << "\n";
    std::cout
        << "Prime Implicants\n";

    print_separator();

    std::cout
        << "Index    Pattern    Expression    Literals\n";

    print_separator(
        '-',
        55
    );

    for (size_t i = 0;
         i < primes.size();
         ++i)
    {
        std::cout
            << "P"
            << i
            << "       "
            << primes[i].to_binary_string()
            << "       "
            << primes[i].to_expression()
            << "          "
            << primes[i].literal_count()
            << "\n";
    }
}


// ============================================================
// prime implicant chart
// ============================================================

void printer::print_prime_chart(
    const quine_mccluskey::prime_chart& chart,
    const std::vector<implicant>& primes
)
{
    std::cout << "\n";
    std::cout
        << "Prime Implicant Chart\n";

    print_separator();

    std::cout
        << "Minterm    Prime Implicants\n";

    print_separator(
        '-',
        40
    );

    for (const auto& entry :
         chart)
    {
        std::cout
            << std::left
            << std::setw(11)
            << entry.first;

        for (size_t i = 0;
             i < entry.second.size();
             ++i)
        {
            if (i > 0)
            {
                std::cout << ", ";
            }

            std::cout
                << "P"
                << entry.second[i];
        }

        std::cout << "\n";
    }
}


void printer::print_essential_primes(
    const std::set<int>& essential,
    const std::vector<implicant>& primes
)
{
    std::cout << "\n";
    std::cout
        << "Essential Prime Implicants\n";

    print_separator();

    if (essential.empty())
    {
        std::cout
            << "None\n";

        return;
    }

    for (int index :
         essential)
    {
        if (index < 0 ||
            static_cast<size_t>(index) >=
                primes.size())
        {
            continue;
        }

        std::cout
            << "P"
            << index
            << " = "
            << primes[index].to_expression()
            << "\n";
    }
}


// ============================================================
// Petrick
// ============================================================

void printer::print_petrick_expression(
    const petrick::expression& expression,
    const std::vector<implicant>& primes
)
{
    std::cout << "\n";
    std::cout
        << "Petrick's Expression\n";

    print_separator();

    if (expression.empty())
    {
        std::cout
            << "1\n";

        return;
    }

    for (size_t i = 0;
         i < expression.size();
         ++i)
    {
        if (i > 0)
        {
            std::cout
                << " + ";
        }

        const auto& product =
            expression[i];

        if (product.empty())
        {
            std::cout << "1";
            continue;
        }

        bool first = true;

        for (int index :
             product)
        {
            if (!first)
            {
                std::cout
                    << " ";

            }

            std::cout
                << "P"
                << index;

            first = false;
        }
    }

    std::cout << "\n";
}


void printer::print_petrick_solutions(
    const std::vector<petrick::product>& solutions,
    const std::vector<implicant>& primes
)
{
    std::cout << "\n";
    std::cout
        << "Minimum Petrick Solutions\n";

    print_separator();

    if (solutions.empty())
    {
        std::cout
            << "None\n";

        return;
    }

    for (size_t i = 0;
         i < solutions.size();
         ++i)
    {
        std::cout
            << "Solution "
            << i + 1
            << ": ";

        bool first = true;

        for (int index :
             solutions[i])
        {
            if (!first)
            {
                std::cout
                    << " ";

            }

            std::cout
                << "P"
                << index;

            first = false;
        }

        std::cout << "\n";
    }
}


// ============================================================
// final result
// ============================================================

void printer::print_sop(
    const expression& minimized
)
{
    std::cout << "\n";
    std::cout
        << "Minimized SOP\n";

    print_separator();

    std::cout
        << "F = "
        << minimized.to_sop()
        << "\n";
}


void printer::print_pos(
    const std::string& pos
)
{
    std::cout << "\n";
    std::cout
        << "Minimized POS\n";

    print_separator();

    std::cout
        << "F = "
        << pos
        << "\n";
}


void printer::print_statistics(
    const expression& minimized
)
{
    std::cout << "\n";
    std::cout
        << "Optimization Statistics\n";

    print_separator();

    std::cout
        << "Terms    : "
        << minimized.term_count()
        << "\n";

    std::cout
        << "Literals : "
        << minimized.literal_count()
        << "\n";
}


// ============================================================
// verification
// ============================================================

void printer::print_verification_result(
    bool passed
)
{
    std::cout << "\n";
    std::cout
        << "Verification\n";

    print_separator();

    if (passed)
    {
        std::cout
            << "PASS - Original and minimized "
               "functions are equivalent.\n";
    }
    else
    {
        std::cout
            << "FAIL - The functions are NOT equivalent.\n";
    }
}


void printer::print_truth_table(
    const truth_table& table,
    const expression& minimized
)
{
    std::cout << "\n";
    std::cout
        << "Truth Table\n";

    print_separator();

    table.print(minimized);
}


void printer::print_mismatches(
    const truth_table& table,
    const expression& minimized
)
{
    std::cout << "\n";
    std::cout
        << "Verification Mismatches\n";

    print_separator();

    table.print_mismatches(minimized);
}


// ============================================================
// complete report
// ============================================================

void printer::print_complete_report(
    const boolean_function& function,
    const expression& sop,
    const std::string& pos,
    bool verification_passed
)
{
    print_banner();

    print_function(function);

    print_sop(sop);

    print_pos(pos);

    print_statistics(sop);

    print_verification_result(
        verification_passed
    );

    print_separator(
        '=',
        60
    );
}
