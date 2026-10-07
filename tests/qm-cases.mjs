export const cases = [
  { name: "simple function", variables: 3, minterms: "1,3", dontCares: "" },
  { name: "multiple minterms", variables: 3, minterms: "0,1,2,5,6,7", dontCares: "" },
  { name: "multiple combination rounds", variables: 3, minterms: "0,1,2,3,4,5,6", dontCares: "" },
  { name: "don't-care optimization", variables: 3, minterms: "1,3", dontCares: "5,7" },
  { name: "essential prime implicants", variables: 4, minterms: "0,1,2,5,6,7,8,9,10,14", dontCares: "" },
  { name: "Petrick-required cover", variables: 3, minterms: "0,2,3,4,5", dontCares: "" },
  { name: "multiple equally optimal covers", variables: 3, minterms: "1,2,3,4,5", dontCares: "" },
  { name: "constant zero", variables: 3, minterms: "", dontCares: "" },
  { name: "constant one", variables: 3, minterms: "0,1,2,3,4,5,6,7", dontCares: "" },
  { name: "invalid term", variables: 3, minterms: "8", dontCares: "" },
  { name: "six-variable boundary", variables: 6, minterms: "63", dontCares: "" },
];
