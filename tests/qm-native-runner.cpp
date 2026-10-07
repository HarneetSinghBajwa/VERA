#include <iostream>
#include <string>

extern "C" const char* vera_qm_minimize(
    int variable_count,
    const char* minterms_csv,
    const char* dont_cares_csv
);

int main(int argc, char** argv)
{
    if (argc != 4)
    {
        std::cerr << "Usage: qm-native-runner <variables> <minterms-csv> <dont-cares-csv>\n";
        return 2;
    }

    try
    {
        const int variable_count = std::stoi(argv[1]);
        std::cout << vera_qm_minimize(variable_count, argv[2], argv[3]);
    }
    catch (...)
    {
        std::cerr << "Invalid variable count.\n";
        return 2;
    }
}
