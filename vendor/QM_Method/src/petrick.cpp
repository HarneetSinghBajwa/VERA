#include "../include/petrick.h"

#include <algorithm>
#include <sstream>


// ============================================================
// constructor
// ============================================================

petrick::petrick(
    const quine_mccluskey::prime_chart& chart,
    const std::vector<implicant>& prime_implicants,
    const std::set<int>& essential_primes
)
    : chart(chart),
      prime_implicants(prime_implicants),
      essential_primes(essential_primes)
{
}


// ============================================================
// solve
// ============================================================

std::set<int> petrick::solve()
{
    // Start with all essential prime implicants.

    std::set<int> solution = essential_primes;

    // Find minterms that are not already covered.

    std::vector<unsigned int> uncovered =
        get_uncovered_minterms();

    // Nothing remains to solve.

    if (uncovered.empty())
    {
        return solution;
    }

    // Build the Petrick expression.

    expression petrick_expression =
        build_expression();

    // Find minimum products.

    std::vector<product> minimum_products =
        find_minimum_products(petrick_expression);

    if (minimum_products.empty())
    {
        return solution;
    }

    // We return the first minimum solution.
    //
    // All equally optimal solutions can be obtained
    // through find_minimum_products().

    solution.insert(
        minimum_products[0].begin(),
        minimum_products[0].end()
    );

    return solution;
}


// ============================================================
// build Petrick expression
// ============================================================

petrick::expression petrick::build_expression() const
{
    expression result;

    std::vector<unsigned int> uncovered =
        get_uncovered_minterms();

    // Each minterm becomes a sum:
    //
    // m1 -> P1 + P3
    //
    // represented as:
    //
    // { {1}, {3} }

    bool first_minterm = true;

    for (unsigned int minterm : uncovered)
    {
        expression minterm_expression;

        auto it = chart.find(minterm);

        if (it == chart.end())
        {
            continue;
        }

        for (int prime_index : it->second)
        {
            // Essential primes don't need to appear
            // in Petrick because they are already selected.

            if (essential_primes.count(prime_index))
            {
                continue;
            }

            minterm_expression.push_back(
                {prime_index}
            );
        }

        // If this minterm has no non-essential
        // covering prime, something is inconsistent
        // in the chart.

        if (minterm_expression.empty())
        {
            continue;
        }

        if (first_minterm)
        {
            result = minterm_expression;
            first_minterm = false;
        }
        else
        {
            result = multiply(
                result,
                minterm_expression
            );

            result = remove_duplicates(result);

            result = absorb(result);
        }
    }

    return result;
}


// ============================================================
// multiply
// ============================================================

petrick::expression petrick::multiply(
    const expression& lhs,
    const expression& rhs
) const
{
    expression result;

    // Distributive law:
    //
    // (A + B)(C + D)
    //
    // =
    //
    // AC + AD + BC + BD

    for (const product& left_product : lhs)
    {
        for (const product& right_product : rhs)
        {
            product new_product =
                left_product;

            new_product.insert(
                right_product.begin(),
                right_product.end()
            );

            result.push_back(
                new_product
            );
        }
    }

    return result;
}


// ============================================================
// remove duplicates
// ============================================================

petrick::expression petrick::remove_duplicates(
    const expression& expr
) const
{
    expression result;

    for (const product& current : expr)
    {
        if (std::find(
                result.begin(),
                result.end(),
                current
            ) == result.end())
        {
            result.push_back(current);
        }
    }

    return result;
}


// ============================================================
// absorption
// ============================================================

petrick::expression petrick::absorb(
    const expression& expr
) const
{
    expression result = remove_duplicates(expr);

    // Absorption:
    //
    // A + AB = A
    //
    // If product A is a subset of product AB,
    // AB can be removed.

    for (size_t i = 0; i < result.size(); )
    {
        bool remove_i = false;

        for (size_t j = 0; j < result.size(); ++j)
        {
            if (i == j)
            {
                continue;
            }

            const product& a = result[i];
            const product& b = result[j];

            // If b is a subset of a:
            //
            // b = A
            // a = AB
            //
            // remove AB.

            if (std::includes(
                    a.begin(),
                    a.end(),
                    b.begin(),
                    b.end()
                ))
            {
                if (b.size() < a.size())
                {
                    remove_i = true;
                    break;
                }
            }
        }

        if (remove_i)
        {
            result.erase(
                result.begin() + i
            );
        }
        else
        {
            ++i;
        }
    }

    return result;
}


// ============================================================
// find minimum products
// ============================================================

std::vector<petrick::product>
petrick::find_minimum_products(
    const expression& expr
) const
{
    std::vector<product> minimum;

    if (expr.empty())
    {
        return minimum;
    }

    // Find minimum number of prime implicants.

    size_t minimum_terms =
        expr[0].size();

    for (const product& current : expr)
    {
        minimum_terms =
            std::min(
                minimum_terms,
                current.size()
            );
    }

    // Keep only products with the minimum
    // number of terms.

    for (const product& current : expr)
    {
        if (current.size() == minimum_terms)
        {
            minimum.push_back(current);
        }
    }

    // Among equal-term solutions, find minimum
    // literal count.

    int minimum_literals = -1;

    for (const product& current : minimum)
    {
        int literals =
            literal_count(current);

        if (minimum_literals == -1 ||
            literals < minimum_literals)
        {
            minimum_literals = literals;
        }
    }

    std::vector<product> final_solutions;

    for (const product& current : minimum)
    {
        if (literal_count(current) ==
            minimum_literals)
        {
            final_solutions.push_back(current);
        }
    }

    return final_solutions;
}


// ============================================================
// product covers minterm
// ============================================================

bool petrick::product_covers_minterm(
    const product& product,
    unsigned int minterm
) const
{
    for (int prime_index : product)
    {
        if (prime_index < 0 ||
            static_cast<size_t>(prime_index) >=
                prime_implicants.size())
        {
            continue;
        }

        if (prime_implicants[prime_index]
                .covers(minterm))
        {
            return true;
        }
    }

    return false;
}


// ============================================================
// get uncovered minterms
// ============================================================

std::vector<unsigned int>
petrick::get_uncovered_minterms() const
{
    std::vector<unsigned int> uncovered;

    for (const auto& entry : chart)
    {
        unsigned int minterm =
            entry.first;

        bool covered_by_essential = false;

        for (int prime_index : entry.second)
        {
            if (essential_primes.count(prime_index))
            {
                covered_by_essential = true;
                break;
            }
        }

        if (!covered_by_essential)
        {
            uncovered.push_back(minterm);
        }
    }

    return uncovered;
}


// ============================================================
// literal count
// ============================================================

int petrick::literal_count(
    const product& product
) const
{
    int count = 0;

    for (int prime_index : product)
    {
        if (prime_index >= 0 &&
            static_cast<size_t>(prime_index) <
                prime_implicants.size())
        {
            count +=
                prime_implicants[prime_index]
                    .literal_count();
        }
    }

    return count;
}


// ============================================================
// to string
// ============================================================

std::string petrick::to_string(
    const expression& expr
) const
{
    if (expr.empty())
    {
        return "0";
    }

    std::ostringstream output;

    for (size_t i = 0; i < expr.size(); ++i)
    {
        if (i > 0)
        {
            output << " + ";
        }

        const product& current =
            expr[i];

        if (current.empty())
        {
            output << "1";
            continue;
        }

        bool first = true;

        for (int prime_index : current)
        {
            if (!first)
            {
                output << " ";
            }

            output << "P" << prime_index;

            first = false;
        }
    }

    return output.str();
}