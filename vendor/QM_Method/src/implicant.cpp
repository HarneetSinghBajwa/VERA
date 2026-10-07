#include "../include/implicant.h"


// ============================================================
// constructors
// ============================================================

implicant::implicant()
{
    combined = false;
}


implicant::implicant(const pattern& bits)
{
    this->bits = bits;
    combined = false;
}


implicant::implicant(
    const pattern& bits,
    const std::set<unsigned int>& covered_minterms
)
{
    this->bits = bits;
    this->covered_minterms = covered_minterms;
    combined = false;
}


// ============================================================
// getters
// ============================================================

const implicant::pattern& implicant::get_pattern() const
{
    return bits;
}


const std::set<unsigned int>&
implicant::get_covered_minterms() const
{
    return covered_minterms;
}


bool implicant::is_combined() const
{
    return combined;
}


// ============================================================
// QM operations
// ============================================================

void implicant::mark_combined()
{
    combined = true;
}


int implicant::count_ones() const
{
    int count = 0;

    for (int bit : bits)
    {
        if (bit == 1)
        {
            count++;
        }
    }

    return count;
}


int implicant::literal_count() const
{
    int count = 0;

    for (int bit : bits)
    {
        // -1 represents a don't-care,
        // therefore it is not a literal.

        if (bit != -1)
        {
            count++;
        }
    }

    return count;
}


bool implicant::can_combine(const implicant& other) const
{
    // Both implicants must have the same number
    // of variables.

    if (bits.size() != other.bits.size())
    {
        return false;
    }

    int differences = 0;

    for (size_t i = 0; i < bits.size(); i++)
    {
        int a = bits[i];
        int b = other.bits[i];

        // A dash must match a dash.
        //
        // Example:
        //
        // 10-1
        // 11-1
        //
        // CAN combine -> 1--1
        //
        // 10-1
        // 1101
        //
        // CANNOT directly combine.

        if (a == -1 || b == -1)
        {
            if (a != b)
            {
                return false;
            }

            continue;
        }

        if (a != b)
        {
            differences++;
        }

        // More than one difference means
        // the implicants cannot combine.

        if (differences > 1)
        {
            return false;
        }
    }

    // QM requires exactly one differing bit.

    return differences == 1;
}


implicant implicant::combine(const implicant& other) const
{
    pattern new_bits;

    for (size_t i = 0; i < bits.size(); i++)
    {
        if (bits[i] == other.bits[i])
        {
            new_bits.push_back(bits[i]);
        }
        else
        {
            // The differing position becomes
            // a don't-care.

            new_bits.push_back(-1);
        }
    }

    // Combine the minterms represented by both
    // implicants.

    std::set<unsigned int> new_covered_minterms =
        covered_minterms;

    new_covered_minterms.insert(
        other.covered_minterms.begin(),
        other.covered_minterms.end()
    );

    return implicant(
        new_bits,
        new_covered_minterms
    );
}


bool implicant::covers(unsigned int minterm) const
{
    // An empty pattern cannot cover anything.

    if (bits.empty())
    {
        return false;
    }

    const size_t number_of_variables = bits.size();

    for (size_t i = 0; i < number_of_variables; i++)
    {
        // Extract the corresponding bit from
        // the minterm.
        //
        // Example:
        //
        // minterm = 5
        //
        // 5 = 0101
        //
        // bits are checked from left to right.

        unsigned int shift =
            number_of_variables - 1 - i;

        int minterm_bit =
            (minterm >> shift) & 1U;

        // -1 means don't-care.
        // Therefore this position doesn't matter.

        if (bits[i] == -1)
        {
            continue;
        }

        // Required bit doesn't match
        // the minterm.

        if (bits[i] != minterm_bit)
        {
            return false;
        }
    }

    return true;
}


// ============================================================
// representation
// ============================================================

std::string implicant::to_binary_string() const
{
    std::string result;

    for (int bit : bits)
    {
        if (bit == 1)
        {
            result += '1';
        }
        else if (bit == 0)
        {
            result += '0';
        }
        else
        {
            result += '-';
        }
    }

    return result;
}


std::string implicant::to_expression() const
{
    std::string expression;

    for (size_t i = 0; i < bits.size(); i++)
    {
        // Don't-care means this variable
        // disappears from the expression.

        if (bits[i] == -1)
        {
            continue;
        }

        // Variable naming:
        //
        // 0 -> A
        // 1 -> B
        // 2 -> C
        // 3 -> D
        // ...

        char variable =
            static_cast<char>('A' + i);

        expression += variable;

        // 0 means complemented variable.

        if (bits[i] == 0)
        {
            expression += '\'';
        }
    }

    // No literals means constant 1.

    if (expression.empty())
    {
        return "1";
    }

    return expression;
}


// ============================================================
// comparison
// ============================================================

bool implicant::operator==(const implicant& other) const
{
    return bits == other.bits;
}


bool implicant::operator<(const implicant& other) const
{
    return bits < other.bits;
}
