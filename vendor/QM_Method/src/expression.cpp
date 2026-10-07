#include "../include/expression.h"

#include <sstream>


// ============================================================
// constructors
// ============================================================

expression::expression()
{
    variable_count = 0;
}


expression::expression(int variable_count)
{
    this->variable_count = variable_count;
}


expression::expression(
    int variable_count,
    const std::vector<implicant>& implicants
)
{
    this->variable_count = variable_count;
    this->implicants = implicants;
}


// ============================================================
// implicants
// ============================================================

void expression::add_implicant(
    const implicant& value
)
{
    implicants.push_back(value);
}


void expression::clear()
{
    implicants.clear();
}


const std::vector<implicant>&
expression::get_implicants() const
{
    return implicants;
}


// ============================================================
// variable information
// ============================================================

int expression::get_variable_count() const
{
    return variable_count;
}


// ============================================================
// SOP
// ============================================================

std::string expression::to_sop() const
{
    // No implicants means F = 0.

    if (implicants.empty())
    {
        return "0";
    }

    std::ostringstream result;

    for (size_t i = 0; i < implicants.size(); ++i)
    {
        if (i > 0)
        {
            result << " + ";
        }

        result << implicants[i].to_expression();
    }

    return result.str();
}


// ============================================================
// POS
// ============================================================

std::string expression::to_pos(
    const std::vector<implicant>& pos_implicants
) const
{
    // No POS implicants means the function is 1.

    if (pos_implicants.empty())
    {
        return "1";
    }

    std::ostringstream result;

    for (size_t i = 0; i < pos_implicants.size(); ++i)
    {
        if (i > 0)
        {
            result << " ";
        }

        const implicant::pattern& bits =
            pos_implicants[i].get_pattern();

        // An implicant of F' represents a product:
        //
        // A'BC
        //
        // After applying De Morgan:
        //
        // A + B' + C'
        //
        // Therefore:
        //
        // 0 -> variable appears uncomplemented
        // 1 -> variable appears complemented
        // - -> variable disappears

        result << "(";

        bool first_literal = true;

        for (size_t j = 0; j < bits.size(); ++j)
        {
            if (bits[j] == -1)
            {
                continue;
            }

            if (!first_literal)
            {
                result << " + ";
            }

            char variable =
                static_cast<char>('A' + j);

            result << variable;

            if (bits[j] == 1)
            {
                result << "'";
            }

            first_literal = false;
        }

        // If the implicant is all don't-cares,
        // its complement is 0.
        //
        // Therefore the entire POS becomes 0.

        if (first_literal)
        {
            result << "0";
        }

        result << ")";
    }

    return result.str();
}


// ============================================================
// information
// ============================================================

int expression::term_count() const
{
    return static_cast<int>(
        implicants.size()
    );
}


int expression::literal_count() const
{
    int count = 0;

    for (const implicant& current : implicants)
    {
        count += current.literal_count();
    }

    return count;
}


// ============================================================
// evaluation
// ============================================================

bool expression::evaluate(
    const std::vector<int>& input
) const
{
    // A sum of products is 1 if at least one
    // implicant evaluates to 1.

    for (const implicant& current : implicants)
    {
        const implicant::pattern& bits =
            current.get_pattern();

        // Input size must match the expression.

        if (input.size() != bits.size())
        {
            return false;
        }

        bool product_value = true;

        for (size_t i = 0; i < bits.size(); ++i)
        {
            // Don't-care.
            //
            // This variable has no effect on
            // this product term.

            if (bits[i] == -1)
            {
                continue;
            }

            // Required value does not match
            // the input.

            if (bits[i] != input[i])
            {
                product_value = false;
                break;
            }
        }

        // One product being true means the entire
        // SOP is true.

        if (product_value)
        {
            return true;
        }
    }

    return false;
}


// ============================================================
// utility
// ============================================================

bool expression::is_zero() const
{
    return implicants.empty();
}


bool expression::is_one() const
{
    for (const implicant& current : implicants)
    {
        const implicant::pattern& bits =
            current.get_pattern();

        bool all_dont_care = true;

        for (int bit : bits)
        {
            if (bit != -1)
            {
                all_dont_care = false;
                break;
            }
        }

        if (all_dont_care)
        {
            return true;
        }
    }

    return false;
}
