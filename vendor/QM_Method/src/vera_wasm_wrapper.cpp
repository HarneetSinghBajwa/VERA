#include "../include/expression.h"
#include "../include/parser.h"
#include "../include/petrick.h"
#include "../include/quine_mccluskey.h"
#include "../include/truth_table.h"

#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace
{
    std::string json_string(const std::string& value)
    {
        std::ostringstream output;
        output << '"';

        for (unsigned char character : value)
        {
            switch (character)
            {
                case '"': output << "\\\""; break;
                case '\\': output << "\\\\"; break;
                case '\b': output << "\\b"; break;
                case '\f': output << "\\f"; break;
                case '\n': output << "\\n"; break;
                case '\r': output << "\\r"; break;
                case '\t': output << "\\t"; break;
                default:
                    if (character < 0x20)
                    {
                        const char hex[] = "0123456789abcdef";
                        output << "\\u00"
                               << hex[(character >> 4) & 0x0f]
                               << hex[character & 0x0f];
                    }
                    else
                    {
                        output << static_cast<char>(character);
                    }
            }
        }

        output << '"';
        return output.str();
    }

    template <typename Values>
    void write_numbers(std::ostringstream& output, const Values& values)
    {
        output << '[';
        bool first = true;
        for (const auto& value : values)
        {
            if (!first) output << ',';
            output << value;
            first = false;
        }
        output << ']';
    }

    void write_implicant(std::ostringstream& output, const implicant& value)
    {
        output << "{\"pattern\":" << json_string(value.to_binary_string())
               << ",\"covered\":";
        write_numbers(output, value.get_covered_minterms());
        output << '}';
    }

    void write_implicants(
        std::ostringstream& output,
        const std::vector<implicant>& values
    )
    {
        output << '[';
        for (size_t index = 0; index < values.size(); ++index)
        {
            if (index) output << ',';
            write_implicant(output, values[index]);
        }
        output << ']';
    }

    std::string error_result(const std::string& message)
    {
        return "{\"error\":" + json_string(message) + "}";
    }

    std::string run_minimizer(
        int variable_count,
        const std::string& minterms,
        const std::string& dont_cares
    )
    {
        if (variable_count < 1 || variable_count > 6)
        {
            return error_result("Choose between 1 and 6 variables.");
        }

        try
        {
            std::ostringstream notation;
            notation << "F(";
            for (int index = 0; index < variable_count; ++index)
            {
                if (index) notation << ',';
                notation << static_cast<char>('A' + index);
            }
            notation << ")=m(" << minterms << ')';
            if (!dont_cares.empty())
            {
                notation << "+d(" << dont_cares << ')';
            }

            const boolean_function function =
                parser::parse_function(notation.str());

            quine_mccluskey qm(
                function.variable_count,
                function.minterms,
                function.dont_cares
            );
            const std::vector<implicant> primes =
                qm.generate_prime_implicants();
            const quine_mccluskey::prime_chart chart =
                qm.build_prime_chart();
            const std::set<int> essential =
                qm.find_essential_prime_implicants(chart);

            petrick solver(chart, primes, essential);
            const petrick::expression petrick_expression =
                solver.build_expression();
            const std::vector<petrick::product> minimum_products =
                solver.find_minimum_products(petrick_expression);
            const std::set<int> selected = solver.solve();

            std::vector<implicant> selected_implicants;
            for (int index : selected)
            {
                selected_implicants.push_back(primes.at(
                    static_cast<size_t>(index)
                ));
            }

            const expression minimized(
                function.variable_count,
                selected_implicants
            );
            const truth_table table(function);
            const std::vector<truth_table_row> rows =
                table.generate(minimized);

            std::ostringstream output;
            output << "{\"expression\":" << json_string(minimized.to_sop())
                   << ",\"primeImplicants\":";
            write_implicants(output, primes);

            output << ",\"rounds\":[";
            const auto& rounds = qm.get_combination_rounds();
            for (size_t index = 0; index < rounds.size(); ++index)
            {
                if (index) output << ',';
                write_implicants(output, rounds[index]);
            }

            output << "],\"essential\":";
            write_numbers(output, essential);

            output << ",\"selected\":";
            write_numbers(output, selected);

            output << ",\"optimalCovers\":[";
            if (minimum_products.empty())
            {
                write_numbers(output, selected);
            }
            else
            {
                for (size_t index = 0; index < minimum_products.size(); ++index)
                {
                    if (index) output << ',';
                    std::set<int> cover = essential;
                    cover.insert(
                        minimum_products[index].begin(),
                        minimum_products[index].end()
                    );
                    write_numbers(output, cover);
                }
            }
            output << ']';

            output << ",\"primeChart\":[";
            bool first_chart_entry = true;
            for (const auto& entry : chart)
            {
                if (!first_chart_entry) output << ',';
                output << "{\"minterm\":" << entry.first << ",\"primes\":";
                write_numbers(output, entry.second);
                output << '}';
                first_chart_entry = false;
            }

            output << "],\"truthTable\":[";
            for (size_t index = 0; index < rows.size(); ++index)
            {
                if (index) output << ',';
                output << "{\"bits\":";
                write_numbers(output, rows[index].input);
                output << ",\"value\":" << index
                       << ",\"minimized\":"
                       << (rows[index].minimized_output ? 1 : 0)
                       << '}';
            }

            output << "],\"verified\":"
                   << (table.verify(minimized) ? "true" : "false")
                   << '}';
            return output.str();
        }
        catch (const std::exception& error)
        {
            return error_result(error.what());
        }
        catch (...)
        {
            return error_result("The C++ minimizer could not process that input.");
        }
    }
}

extern "C"
{
    const char* vera_qm_minimize(
        int variable_count,
        const char* minterms_csv,
        const char* dont_cares_csv
    )
    {
        static thread_local std::string result;
        result = run_minimizer(
            variable_count,
            minterms_csv ? minterms_csv : "",
            dont_cares_csv ? dont_cares_csv : ""
        );
        return result.c_str();
    }
}
