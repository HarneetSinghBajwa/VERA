#include "../include/implicant.h"
#include "../include/quine_mccluskey.h"
#include "../include/petrick.h"
#include "../include/expression.h"
#include "../include/parser.h"
#include "../include/truth_table.h"
#include "../include/printer.h"

#include <exception>
#include <iostream>
#include <set>
#include <string>
#include <vector>


int main()
{
    try
    {
        // ====================================================
        // 1. Banner
        // ====================================================

        printer::print_banner();


        // ====================================================
        // 2. Get Boolean function from user
        // ====================================================

        boolean_function function =
            parser::interactive_input();


        // ====================================================
        // 3. Display input
        // ====================================================

        printer::print_function(function);


        // ====================================================
        // 4. Run Quine-McCluskey
        // ====================================================

        quine_mccluskey qm(
            function.variable_count,
            function.minterms,
            function.dont_cares
        );

        std::vector<implicant> primes =
            qm.generate_prime_implicants();


        // ====================================================
        // 5. Display prime implicants
        // ====================================================

        printer::print_prime_implicants(
            primes
        );


        // ====================================================
        // 6. Build prime implicant chart
        // ====================================================

        quine_mccluskey::prime_chart chart =
            qm.build_prime_chart();


        printer::print_prime_chart(
            chart,
            primes
        );


        // ====================================================
        // 7. Find essential prime implicants
        // ====================================================

        std::set<int> essential =
            qm.find_essential_prime_implicants(
                chart
            );


        printer::print_essential_primes(
            essential,
            primes
        );


        // ====================================================
        // 8. Petrick's method
        // ====================================================

        petrick petrick_solver(
            chart,
            primes,
            essential
        );


        petrick::expression
            petrick_expression =
                petrick_solver.build_expression();


        printer::print_petrick_expression(
            petrick_expression,
            primes
        );


        // ====================================================
        // 9. Find minimum cover
        // ====================================================

        std::set<int> solution_indices =
            petrick_solver.solve();


        // ====================================================
        // 10. Convert solution indices into
        //     actual implicants
        // ====================================================

        std::vector<implicant> solution;

        for (int index : solution_indices)
        {
            if (index >= 0 &&
                static_cast<size_t>(index) <
                    primes.size())
            {
                solution.push_back(
                    primes[index]
                );
            }
        }


        // ====================================================
        // 11. Construct minimized SOP
        // ====================================================

        expression sop(
            function.variable_count,
            solution
        );


        // ====================================================
        // 12. Verify result
        // ====================================================

        truth_table verifier(
            function
        );


        bool verification_passed =
            verifier.verify(sop);


        // ====================================================
        // 13. Display final result
        // ====================================================

        printer::print_sop(
            sop
        );


        printer::print_statistics(
            sop
        );


        printer::print_verification_result(
            verification_passed
        );


        // ====================================================
        // 14. Optional truth table
        // ====================================================

        char choice;

        std::cout
            << "\nShow truth table? (y/n): ";

        std::cin
            >> choice;

        if (choice == 'y' ||
            choice == 'Y')
        {
            printer::print_truth_table(
                verifier,
                sop
            );
        }


        // ====================================================
        // 15. Mismatch debugging
        // ====================================================

        if (!verification_passed)
        {
            printer::print_mismatches(
                verifier,
                sop
            );
        }


        std::cout << "\n";

        return 0;
    }
    catch (const std::exception& error)
    {
        std::cerr
            << "\nError: "
            << error.what()
            << "\n";

        return 1;
    }
}