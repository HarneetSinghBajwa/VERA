#ifndef IMPLICANT_H
#define IMPLICANT_H

#include <string>
#include <vector>
#include <set>

class implicant
{
public:

    // 1  -> variable is 1
    // 0  -> variable is 0
    // -1 -> don't care

    using pattern = std::vector<int>;

private:

    // Example:
    // {1, 0, -1, 1} -> 10-1

    pattern bits;

    // Original minterms represented by this implicant.
    //
    // Example:
    // 00-- covers {0, 1, 2, 3}

    std::set<unsigned int> covered_minterms;

    // Used by the Quine-McCluskey combining process.
    bool combined;

public:

    // constructors

    implicant();

    explicit implicant(const pattern& bits);

    implicant(
        const pattern& bits,
        const std::set<unsigned int>& covered_minterms
    );

    // getters

    const pattern& get_pattern() const;

    const std::set<unsigned int>& get_covered_minterms() const;

    bool is_combined() const;

    // QM operations

    void mark_combined();

    int count_ones() const;

    int literal_count() const;

    bool can_combine(const implicant& other) const;

    implicant combine(const implicant& other) const;

    bool covers(unsigned int minterm) const;

    // representation

    std::string to_binary_string() const;

    std::string to_expression() const;

    // comparison

    bool operator==(const implicant& other) const;

    bool operator<(const implicant& other) const;
};

#endif

