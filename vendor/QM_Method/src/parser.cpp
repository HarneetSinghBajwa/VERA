#include "../include/parser.h"

#include <algorithm>
#include <cctype>
#include <iostream>
#include <regex>
#include <sstream>
#include <limits>
#include <stdexcept>

namespace
{
    // ============================================================
    // helper functions
    // ============================================================

    std::string remove_spaces(const std::string& input)
    {
        std::string result;

        for (char c : input)
        {
            if (!std::isspace(
                    static_cast<unsigned char>(c)))
            {
                result += c;
            }
        }

        return result;
    }

    // Extract the number of variables from:
    // F(A,B,C,D)=...
    int extract_variable_count(
        const std::string& input
    )
    {
        std::regex variables_pattern(
            R"(\(([A-Za-z](?:\s*,\s*[A-Za-z])*)\))"
        );

        std::smatch match;

        if (std::regex_search(
                input,
                match,
                variables_pattern))
        {
            std::string variable_list =
                match[1].str();

            int count = 1;

            for (char c : variable_list)
            {
                if (c == ',')
                {
                    count++;
                }
            }

            return count;
        }

        return -1;
    }

    // Extract numbers from a comma-separated section.
    std::vector<unsigned int> extract_numbers(
        const std::string& input
    )
    {
        std::vector<unsigned int> numbers;

        std::stringstream stream(input);
        std::string token;

        while (std::getline(
            stream,
            token,
            ','
        ))
        {
            if (token.empty())
            {
                continue;
            }

            try
            {
                unsigned long value =
                    std::stoul(token);

                numbers.push_back(
                    static_cast<unsigned int>(value)
                );
            }
            catch (...)
            {
                throw std::invalid_argument(
                    "Invalid number: " + token
                );
            }
        }

        return numbers;
    }
}


// ============================================================
// interactive input
// ============================================================

boolean_function parser::interactive_input()
{
    boolean_function function{};

    // --------------------------------------------------------
    // variables
    // --------------------------------------------------------

    std::cout
        << "Number of variables: ";

    std::cin
        >> function.variable_count;

    std::cin.ignore(
        std::numeric_limits<std::streamsize>::max(),
        '\n'
    );

    // --------------------------------------------------------
    // minterms
    // --------------------------------------------------------

    std::string input;

    std::cout
        << "Minterms: ";

    std::getline(
        std::cin,
        input
    );

    function.minterms =
        parse_number_list(input);

    // --------------------------------------------------------
    // don't-cares
    // --------------------------------------------------------

    std::cout
        << "Don't cares (press Enter for none): ";

    std::getline(
        std::cin,
        input
    );

    if (!input.empty())
    {
        function.dont_cares =
            parse_number_list(input);
    }

    // --------------------------------------------------------
    // clean data
    // --------------------------------------------------------

    remove_duplicates(
        function.minterms
    );

    remove_duplicates(
        function.dont_cares
    );

    sort_minterms(
        function.minterms
    );

    sort_minterms(
        function.dont_cares
    );

    resolve_overlap(function);

    // --------------------------------------------------------
    // validation
    // --------------------------------------------------------

    std::string error;

    if (!validate(
            function,
            error))
    {
        throw std::invalid_argument(error);
    }

    return function;
}


// ============================================================
// mathematical notation
// ============================================================

boolean_function parser::parse_function(
    const std::string& input
)
{
    boolean_function function{};

    std::string cleaned =
        remove_spaces(input);

    // --------------------------------------------------------
    // Determine number of variables.
    //
    // Example:
    //
    // F(A,B,C,D)=...
    //
    // gives:
    //
    // 4 variables
    // --------------------------------------------------------

    function.variable_count =
        extract_variable_count(cleaned);

    // --------------------------------------------------------
    // If no variable list exists, reject the input.
    // --------------------------------------------------------

    if (function.variable_count == -1)
    {
        throw std::invalid_argument(
            "Could not determine the number of variables. "
            "Use notation such as F(A,B,C)=m(1,2,3)."
        );
    }

    // --------------------------------------------------------
    // Find minterms.
    //
    // Supports:
    //
    // m(...)
    // M(...)
    // --------------------------------------------------------

    std::regex minterm_pattern(
        R"([mM](?:in)?\(([^)]*)\))"
    );

    std::smatch minterm_match;

    if (std::regex_search(
            cleaned,
            minterm_match,
            minterm_pattern))
    {
        function.minterms =
            extract_numbers(
                minterm_match[1].str()
            );
    }

    // --------------------------------------------------------
    // Find don't-cares.
    //
    // Supports:
    //
    // d(...)
    // D(...)
    // dc(...)
    // DC(...)
    // --------------------------------------------------------

    std::regex dc_pattern(
        R"((?:d|D|dc|DC)\(([^)]*)\))"
    );

    std::smatch dc_match;

    if (std::regex_search(
            cleaned,
            dc_match,
            dc_pattern))
    {
        function.dont_cares =
            extract_numbers(
                dc_match[1].str()
            );
    }

    // --------------------------------------------------------
    // Clean
    // --------------------------------------------------------

    remove_duplicates(
        function.minterms
    );

    remove_duplicates(
        function.dont_cares
    );

    sort_minterms(
        function.minterms
    );

    sort_minterms(
        function.dont_cares
    );

    resolve_overlap(function);

    // --------------------------------------------------------
    // Validate
    // --------------------------------------------------------

    std::string error;

    if (!validate(
            function,
            error))
    {
        throw std::invalid_argument(error);
    }

    return function;
}


// ============================================================
// parse number list
// ============================================================

std::vector<unsigned int>
parser::parse_number_list(
    const std::string& input
)
{
    std::vector<unsigned int> numbers;

    std::stringstream stream(input);

    unsigned int value;

    while (stream >> value)
    {
        numbers.push_back(value);
    }

    return numbers;
}


// ============================================================
// parse parenthesized numbers
// ============================================================

std::vector<unsigned int>
parser::parse_parenthesized_numbers(
    const std::string& input
)
{
    std::size_t open =
        input.find('(');

    std::size_t close =
        input.find(')', open);

    if (open == std::string::npos ||
        close == std::string::npos)
    {
        return {};
    }

    std::string contents =
        input.substr(
            open + 1,
            close - open - 1
        );

    return extract_numbers(contents);
}


// ============================================================
// validation
// ============================================================

bool parser::validate(
    const boolean_function& function,
    std::string& error_message
)
{
    // --------------------------------------------------------
    // Variable count
    // --------------------------------------------------------

    if (function.variable_count <= 0)
    {
        error_message =
            "Number of variables must be greater than 0.";

        return false;
    }

    // --------------------------------------------------------
    // Prevent impossible bit shifts.
    //
    // Our implementation uses unsigned int for minterms,
    // so we limit the number of variables accordingly.
    // --------------------------------------------------------

    if (function.variable_count >=
        static_cast<int>(
            sizeof(unsigned int) * 8))
    {
        error_message =
            "Too many variables for the current "
            "unsigned integer representation.";

        return false;
    }

    // --------------------------------------------------------
    // Empty ON-set
    //
    // Empty minterms means F = 0.
    // This is mathematically valid.
    // --------------------------------------------------------

    if (function.minterms.empty())
    {
        // Valid case.
    }

    // --------------------------------------------------------
    // Validate minterms
    // --------------------------------------------------------

    for (unsigned int minterm :
         function.minterms)
    {
        if (!valid_minterm(
                minterm,
                function.variable_count))
        {
            error_message =
                "Invalid minterm: " +
                std::to_string(minterm);

            return false;
        }
    }

    // --------------------------------------------------------
    // Validate don't-cares
    // --------------------------------------------------------

    for (unsigned int dc :
         function.dont_cares)
    {
        if (!valid_minterm(
                dc,
                function.variable_count))
        {
            error_message =
                "Invalid don't-care term: " +
                std::to_string(dc);

            return false;
        }
    }

    return true;
}


// ============================================================
// valid minterm
// ============================================================

bool parser::valid_minterm(
    unsigned int minterm,
    int variable_count
)
{
    if (variable_count <= 0)
    {
        return false;
    }

    unsigned int maximum =
        (1U << variable_count) - 1U;

    return minterm <= maximum;
}


// ============================================================
// remove duplicates
// ============================================================

void parser::remove_duplicates(
    std::vector<unsigned int>& values
)
{
    std::sort(
        values.begin(),
        values.end()
    );

    values.erase(
        std::unique(
            values.begin(),
            values.end()
        ),
        values.end()
    );
}


// ============================================================
// sort minterms
// ============================================================

void parser::sort_minterms(
    std::vector<unsigned int>& values
)
{
    std::sort(
        values.begin(),
        values.end()
    );
}


// ============================================================
// resolve overlap
// ============================================================

void parser::resolve_overlap(
    boolean_function& function
)
{
    std::vector<unsigned int> cleaned;

    for (unsigned int dc :
         function.dont_cares)
    {
        if (std::find(
                function.minterms.begin(),
                function.minterms.end(),
                dc
            ) == function.minterms.end())
        {
            cleaned.push_back(dc);
        }
    }

    function.dont_cares = cleaned;
}