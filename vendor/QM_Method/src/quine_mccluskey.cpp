#include "../include/quine_mccluskey.h"

#include <algorithm>
#include <iostream>


// ============================================================
// constructor
// ============================================================

quine_mccluskey::quine_mccluskey(
    int variable_count,
    const std::vector<unsigned int>& minterms,
    const std::vector<unsigned int>& dont_cares
)
{
    this->variable_count = variable_count;
    this->minterms = minterms;
    this->dont_cares = dont_cares;
}


// ============================================================
// initial implicants
// ============================================================

std::vector<implicant>
quine_mccluskey::create_initial_implicants() const
{
    std::vector<implicant> implicants;

    for (unsigned int minterm : minterms)
    {
        implicant::pattern bits =
            minterm_to_pattern(minterm);

        std::set<unsigned int> covered;

        covered.insert(minterm);

        implicants.emplace_back(
            bits,
            covered
        );
    }

    for (unsigned int dc : dont_cares)
    {
        implicant::pattern bits =
            minterm_to_pattern(dc);

        std::set<unsigned int> covered;

        covered.insert(dc);

        implicants.emplace_back(
            bits,
            covered
        );
    }

    return implicants;
}


// ============================================================
// grouping
// ============================================================

quine_mccluskey::groups
quine_mccluskey::group_implicants(
    const std::vector<implicant>& implicants
) const
{
    groups grouped;

    for (const implicant& current :
         implicants)
    {
        int ones =
            current.count_ones();

        grouped[ones].push_back(
            current
        );
    }

    return grouped;
}


// ============================================================
// combination
// ============================================================

std::vector<implicant>
quine_mccluskey::combine_groups(
    groups& grouped_implicants
) const
{
    std::vector<implicant> next_round;

    for (auto it =
             grouped_implicants.begin();
         it != grouped_implicants.end();
         ++it)
    {
        auto next_it =
            std::next(it);

        if (next_it ==
            grouped_implicants.end())
        {
            break;
        }

        // Only adjacent groups can combine.
        if (next_it->first !=
            it->first + 1)
        {
            continue;
        }

        std::vector<implicant>& group_a =
            it->second;

        std::vector<implicant>& group_b =
            next_it->second;

        for (implicant& a :
             group_a)
        {
            for (implicant& b :
                 group_b)
            {
                if (!a.can_combine(b))
                {
                    continue;
                }

                /*
                 * These objects have successfully
                 * participated in a combination.
                 *
                 * They are copies inside the groups,
                 * but that is fine because the caller
                 * only uses the grouped objects to
                 * determine which implicants became
                 * combined.
                 */
                a.mark_combined();
                b.mark_combined();

                implicant combined =
                    a.combine(b);

                // Avoid duplicate implicants.
                if (std::find(
                        next_round.begin(),
                        next_round.end(),
                        combined
                    ) == next_round.end())
                {
                    next_round.push_back(
                        combined
                    );
                }
            }
        }
    }

    return next_round;
}


// ============================================================
// prime implicant generation
// ============================================================

std::vector<implicant>
quine_mccluskey::generate_prime_implicants()
{
    prime_implicants.clear();

    std::vector<implicant> current =
        create_initial_implicants();

    while (!current.empty())
    {
        groups grouped =
            group_implicants(current);

        std::vector<implicant> next =
            combine_groups(grouped);

        /*
         * Any implicant that could not be combined
         * in this round is a prime implicant.
         *
         * IMPORTANT:
         *
         * group_implicants() stores copies of the
         * implicants. Therefore, the combined state
         * must be read from these grouped copies,
         * not from 'current'.
         */
        for (const auto& group :
             grouped)
        {
            for (const implicant& current_implicant :
                 group.second)
            {
                if (!current_implicant.is_combined())
                {
                    if (std::find(
                            prime_implicants.begin(),
                            prime_implicants.end(),
                            current_implicant
                        ) == prime_implicants.end())
                    {
                        prime_implicants.push_back(
                            current_implicant
                        );
                    }
                }
            }
        }

        current = next;
    }

    return prime_implicants;
}


// ============================================================
// prime implicant chart
// ============================================================

quine_mccluskey::prime_chart
quine_mccluskey::build_prime_chart() const
{
    prime_chart chart;

    for (unsigned int minterm :
         minterms)
    {
        for (size_t i = 0;
             i < prime_implicants.size();
             ++i)
        {
            if (prime_implicants[i]
                    .covers(minterm))
            {
                chart[minterm].push_back(
                    static_cast<int>(i)
                );
            }
        }
    }

    return chart;
}


// ============================================================
// essential prime implicants
// ============================================================

std::set<int>
quine_mccluskey::find_essential_prime_implicants(
    const prime_chart& chart
) const
{
    std::set<int> essential;

    for (const auto& entry :
         chart)
    {
        const std::vector<int>& covering_primes =
            entry.second;

        /*
         * If exactly one prime implicant covers
         * a minterm, that prime is essential.
         */
        if (covering_primes.size() == 1)
        {
            essential.insert(
                covering_primes[0]
            );
        }
    }

    return essential;
}


// ============================================================
// getters
// ============================================================

int quine_mccluskey::get_variable_count() const
{
    return variable_count;
}


const std::vector<unsigned int>&
quine_mccluskey::get_minterms() const
{
    return minterms;
}


const std::vector<unsigned int>&
quine_mccluskey::get_dont_cares() const
{
    return dont_cares;
}


const std::vector<implicant>&
quine_mccluskey::get_prime_implicants() const
{
    return prime_implicants;
}


// ============================================================
// minterm conversion
// ============================================================

implicant::pattern
quine_mccluskey::minterm_to_pattern(
    unsigned int minterm
) const
{
    implicant::pattern bits;

    bits.reserve(
        variable_count
    );

    /*
     * Convert the integer minterm into a binary
     * pattern.
     *
     * Example for 4 variables:
     *
     *     5 = 0101
     *
     * becomes:
     *
     *     {0, 1, 0, 1}
     */
    for (int i =
             variable_count - 1;
         i >= 0;
         --i)
    {
        int bit =
            (minterm >> i) & 1U;

        bits.push_back(bit);
    }

    return bits;
}

