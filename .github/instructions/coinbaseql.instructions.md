---
applyTo: '**'
---
# Welcome to SQL API

The SQL API is a zero-infrastructure indexing solution that allows any developer to pull real-time and historical onchain data on Base using custom SQL queries. Unlike Wallet History API which provides fixed endpoints for wallet data, SQL API gives you complete flexibility to query any blockchain data.

Developers can access our SQL API through either the CDP SDK or CDP's REST endpoints.

## Key Features

* **Zero Infra:** No setup, no guesswork. Just real-time indexed onchain data.
* **Customizable:** Leverage familiar SQL syntax to pull custom data.
* **Responsive:** Pull custom onchain data with \< 500ms latency.
* **Fresh:** \< 250ms end-to-end from tip of chain.

## Use Cases

* **Payment Service Providers:** Track real-time stablecoin transactions for merchants, consumers, and marketplaces.
* **Portfolio & Treasury:** Give users and institutions a live view of wallet balances and historical flows. Build dashboards that update instantly as funds move across chains, protocols, and counterparties.
* **Onchain Games:** Track player inventory, asset upgrades, and progression in real time as NFT metadata evolves. Enable game mechanics that reflect actual onchain state — not stale snapshots.
* **Onchain Social:** Monitor user interactions like tips, follows, and reactions across decentralized social graphs. Surface meaningful engagement and value transfer between users, apps, and agents.

# SQL API: Quickstart

## Overview

The SQL API allows you to create custom queries to pull real-time and historical onchain data from Base.

In this quickstart, you will learn how to:

* Read and use the tables in CDP's curated schema.
* Pull data from the Base blockchain with a SQL query.
  ​

## Prerequisites

Sign in to the [CDP Portal](https://portal.cdp.coinbase.com/) and [create a CDP Client API key](https://portal.cdp.coinbase.com/projects/api-keys/client-key).

## 1. Write a query

Our example retrieves the most recent indexed event from the `base.events` table.

```sql  theme={null}
SELECT * FROM base.events LIMIT 1
```

The selected table and fields above can be found in our [schema documentation](/data/sql-api/schema).

## 2. Run a query

The SQL API `/run` endpoint accepts this query as a string value. Before running, replace `$CLIENT_TOKEN` with your [CDP Client API key](https://portal.cdp.coinbase.com/projects/api-keys/client-key).

```shell  theme={null}
curl -H "Authorization: Bearer $CLIENT_TOKEN" -H "Content-Type: application/json" -X POST "https://api.cdp.coinbase.com/platform/v2/data/query/run" -d '{"sql": "SELECT * FROM base.events LIMIT 1"}'
```

After running the above, you should see a similar response to the following:

```json  theme={null}
{
  "result": [
    {
      "action": "added",
      "address": "0x8c0075d087de9588ddf5c1441df39828d695bc2f",
      "block_hash": "0x8a337ac527a694e274e46d64bebda0bd40703e589b91f45e8ef3f24ff65ae44c",
      "block_number": "32430528",
      "block_timestamp": "2025-07-04T17:33:23Z",
      "event_name": "ANFEAssetAdded",
      "event_signature": "ANFEAssetAdded(uint256,address,uint8,address,uint256,uint256)",
      "log_index": "13",
      "parameter_types": {
        "adder": "address",
        "amount": "uint256",
        "assetType": "uint8",
        "contractAddress": "address",
        "licenseId": "uint256",
        "tokenId": "uint256"
      },
      "parameters": {
        "adder": "{0x6998723dfdd3ba214f8588b39608aed3a3208628 String}",
        "amount": "{{false [1]} UInt256}",
        "assetType": "{{false [2]} UInt256}",
        "contractAddress": "{0x674ddc6e324142713431a21d3e1bd0140cc700f7 String}",
        "licenseId": "{{false [581194974503308]} UInt256}",
        "tokenId": "{{false [4433908611]} UInt256}"
      },
      "topics": [
        "0x8bd9081c9d8f6eb8f0ffae42d72541d0141c0263b113a738f161eda334e6c2a9"
      ],
      "transaction_from": "0x6998723dfdd3ba214f8588b39608aed3a3208628",
      "transaction_hash": "0xbd85d2e6fd1eeebbfcd7cd45c041e6476497a7211469b99136324b81111f74c7",
      "transaction_to": "0x8c0075d087de9588ddf5c1441df39828d695bc2f"
    }
  ]
}
```

# Schema

The SQL API schema is a set of opinionated tables and columns used to organize onchain data for efficient retrieval. Developers can view the latest schema by calling our [schema endpoint](/data/sql-api/schema).

## Supported Tables

* [base.blocks](#base-blocks) - Block metadata including timestamps and difficulty.
* [base.events](#base-events) - Decoded event logs with contract interactions on Base.
* [base.transactions](#base-transactions) - Transaction data including hash, block number, gas usage.
* [base.encoded\_logs](#base-encoded-logs) - Encoded log data of event logs that aren’t able to be decoded by our event decoder (ex: log0 opcode).
* [base.transfers](#base-transfers) - Token transfer events including block details, addresses, and amounts

## base.blocks

Block metadata including timestamps and difficulty.

| Field                       | Type     | Description                                                                  |
| --------------------------- | -------- | ---------------------------------------------------------------------------- |
| block\_number               | uint64   | The number of the block                                                      |
| block\_hash                 | String   | The unique hash identifying this block                                       |
| parent\_hash                | String   | The hash of the parent block                                                 |
| timestamp                   | DateTime | The timestamp when this block was created                                    |
| miner                       | String   | The address of the miner/validator who created this block                    |
| nonce                       | uint64   | The proof-of-work nonce value                                                |
| sha3\_uncles                | String   | The hash of the uncles list for this block                                   |
| transactions\_root          | String   | The root hash of the transactions trie                                       |
| state\_root                 | String   | The root hash of the state trie                                              |
| receipts\_root              | String   | The root hash of the receipts trie                                           |
| logs\_bloom                 | String   | The bloom filter for the logs of the block                                   |
| gas\_limit                  | uint64   | The maximum gas allowed in this block                                        |
| gas\_used                   | uint64   | The total gas used by all transactions in this block                         |
| base\_fee\_per\_gas         | uint64   | The base fee per gas in this block (EIP-1559)                                |
| total\_difficulty           | String   | The total difficulty of the chain up to this block                           |
| size                        | uint64   | The size of this block in bytes                                              |
| extra\_data                 | String   | Extra data field for this block                                              |
| mix\_hash                   | String   | The mix hash for this block                                                  |
| withdrawals\_root           | String   | The root hash of withdrawals (post-merge)                                    |
| parent\_beacon\_block\_root | String   | The parent beacon block root (post-merge)                                    |
| blob\_gas\_used             | uint64   | The amount of blob gas used in this block                                    |
| excess\_blob\_gas           | uint64   | The excess blob gas in this block                                            |
| transaction\_count          | uint64   | The number of transactions in this block                                     |
| action                      | Int8     | Indicates if block was added (1) or removed (-1) due to chain reorganization |

## base.events

Decoded event logs with contract interactions on Base.

| Field              | Type                                                | Description                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block\_number      | uint64                                              | The block number                                                                                                                                                                                                    |
| block\_hash        | String                                              | A keccak-256 (SHA-3) hash of the block's header data. Unique to the block's contents. Used to verify the integrity of the block                                                                                     |
| timestamp          | DateTime64                                          | Time at which the block was created                                                                                                                                                                                 |
| transaction\_hash  | String                                              | A keccak-256 hash of the signed transaction data. Unique identifier, on the blockchain, for this specific transaction                                                                                               |
| transaction\_to    | String                                              | The address the transaction is acting against. Could be either an EOA (ex: ETH transfer) or a contract (ex: smart contract call)                                                                                    |
| transaction\_from  | String                                              | The address that originated the transaction. Will be an EOA                                                                                                                                                         |
| transaction\_index | uint64                                              | The order in which the transaction was included in the block. Commonly used to match transactions to their logs                                                                                                     |
| log\_index         | uint64                                              | The index of the log within the transaction. First log is in the transaction at index 0, second is index 1, etc                                                                                                     |
| address            | String                                              | The address of the contract that the log was created from                                                                                                                                                           |
| topics             | Array(String)                                       | The topics of the log. Topics are the indexed parameters of the event and the keccak256 hash of the event signature                                                                                                 |
| event\_name        | String                                              | Human-readable name of the event                                                                                                                                                                                    |
| event\_signature   | String                                              | Full canonical declaration of the event, including its name and parameter types. Used to generate the hash                                                                                                          |
| parameters         | Map(String, Variant(Bool, Int256, String, uint256)) | Map of parameter name to its value                                                                                                                                                                                  |
| parameter\_types   | Map(String, String)                                 | Map of parameter name to its ABI type                                                                                                                                                                               |
| action             | Int8                                                | If the log is created, it is 1. If the log is re-orged out it is -1. If the sum of all actions for a given log is greater than 0, the log is "active", meaning it is still in the chain (has not been re-orged out) |

## base.transactions

Transaction data including hash, block number, gas usage.

| Field                        | Type          | Description                                                                        |
| ---------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| block\_number                | uint64        | The number of the block that contains this transaction                             |
| block\_hash                  | String        | The hash of the block that contains this transaction                               |
| transaction\_hash            | String        | The unique hash identifying this transaction                                       |
| transaction\_index           | uint64        | The index position of this transaction within its block                            |
| from\_address                | String        | The address that originated this transaction                                       |
| to\_address                  | String        | The destination address for this transaction                                       |
| value                        | String        | The value being transferred in this transaction                                    |
| gas                          | uint64        | The amount of gas allocated for this transaction                                   |
| gas\_price                   | uint64        | The price of gas (in wei) for this transaction                                     |
| input                        | String        | The data payload sent with this transaction                                        |
| nonce                        | uint64        | The number of transactions sent from this address before this one                  |
| type                         | uint64        | The transaction type                                                               |
| max\_fee\_per\_gas           | uint64        | The maximum fee per gas the sender is willing to pay                               |
| max\_priority\_fee\_per\_gas | uint64        | The maximum priority fee per gas the sender is willing to pay                      |
| chain\_id                    | uint64        | The chain ID this transaction is valid for                                         |
| v                            | String        | The v component of the transaction signature                                       |
| r                            | String        | The r component of the transaction signature                                       |
| s                            | String        | The s component of the transaction signature                                       |
| is\_system\_tx               | Bool          | Whether this is a system transaction                                               |
| max\_fee\_per\_blob\_gas     | String        | The maximum fee per blob gas the sender is willing to pay                          |
| blob\_versioned\_hashes      | Array(String) | Array of versioned hashes for any blobs associated with this transaction           |
| timestamp                    | DateTime64    | The timestamp when this transaction was included in a block                        |
| action                       | Int8          | Indicates if transaction was added (1) or removed (-1) due to chain reorganization |

## base.encoded\_logs

Encoded log data of event logs that aren’t able to be decoded by our event decoder (ex: log0 opcode).

| Field             | Type                               | Description                                                                                                                                                                                                         |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block\_number     | uint64                             | The number of the block that the log is in                                                                                                                                                                          |
| block\_hash       | String                             | The hash of the block that the log is in                                                                                                                                                                            |
| block\_timestamp  | DateTime64                         | The timestamp of the block that the log is in                                                                                                                                                                       |
| transaction\_hash | String                             | The hash of the transaction that the log is in                                                                                                                                                                      |
| transaction\_to   | String                             | The address the transaction is acting against. Could be either an EOA (ex: ETH transfer) or a contract (ex: smart contract call)                                                                                    |
| transaction\_from | String                             | The address that originated the transaction. Will be an EOA                                                                                                                                                         |
| log\_index        | uint32                             | The index of the log within the transaction. First log is in the transaction at index 0, second is index 1, etc                                                                                                     |
| address           | String                             | The address of the contract that the log was created from                                                                                                                                                           |
| topics            | Array(String)                      | The topics of the log. Topics are the indexed parameters of the event and the keccak256 hash of the event signature                                                                                                 |
| action            | Enum8('removed' = -1, 'added' = 1) | If the log is created, it is 1. If the log is re-orged out it is -1. If the sum of all actions for a given log is greater than 0, the log is "active", meaning it is still in the chain (has not been re-orged out) |

## base.transfers

Token transfer events including block details, addresses, and amounts

| Field             | Type       | Description                              |
| ----------------- | ---------- | ---------------------------------------- |
| block\_number     | uint64     | Block number containing the transfer     |
| block\_timestamp  | DateTime64 | Block timestamp                          |
| transaction\_to   | String     | Transaction recipient address            |
| transaction\_from | String     | Transaction sender address               |
| log\_index        | uint32     | Log index within the transaction         |
| token\_address    | String     | Address of the token contract            |
| from\_address     | String     | Address tokens are transferred from      |
| to\_address       | String     | Address tokens are transferred to        |
| value             | uint256    | Amount of tokens transferred             |
| action            | Enum8      | Action: 1 for add, -1 for re-org removal |

# CoinbaSeQL

CoinbaSeQL (pronounced "coinbase QL") is the underlying SQL dialect of the SQL API.

CoinbaSeQL is created with the following principles:

* As similar to standard SQL as possible.
* Don't reinvent the wheel (we allow all common SQL features, per the SQL standard).
* Provide understandable, actionable, and helpful error messages.

## Grammar

When a request is send to the SQL API, we verify that the grammar of the SQL statement is valid CoinbaSeQL. If the grammar is not valid, we return an error.

<Tip>
  LLMs are able to parse and understand this grammar very well! Try entering the table schema and the grammar into the LLM's context window.
</Tip>

```antlr  theme={null}
grammar SqlQuery;

// If you update this grammar, simply run `make gen` from the top-level to update the parsing logic.
// Inspired by ClickHouse parser and lexer:
// https://github.com/abyss7/ClickHouse/blob/master/src/Parsers/New/ClickHouseParser.g4
// https://github.com/abyss7/ClickHouse/blob/master/src/Parsers/New/ClickHouseLexer.g4

// Parser rules
query: cteClause? unionStatement SEMICOLON? EOF;

unionStatement:
	unionSelect (unionOperator unionSelect)* (
		ORDER BY orderByElements
	)? (LIMIT limitClause)?;

unionSelect: selectStatement | LPAREN selectStatement RPAREN;

unionOperator: UNION ALL | UNION DISTINCT | UNION;

cteClause: WITH cteDefinition (COMMA cteDefinition)*;

cteDefinition:
	cteName (LPAREN columnList RPAREN)? AS LPAREN selectStatement RPAREN;

cteName: identifier;

columnList: identifier (COMMA identifier)*;

selectStatement:
	SELECT (DISTINCT)? selectElements FROM tableExpression (
		WHERE condition
	)? (GROUP BY groupByElements)? (ORDER BY orderByElements)? (
		LIMIT limitClause
	)?
	| SELECT (DISTINCT)? selectElements // For literals/expressions without FROM
	(ORDER BY orderByElements)? (LIMIT limitClause)?;

selectElements: STAR | selectElement (COMMA selectElement)*;

selectElement: expression (AS? alias)? | tableWildcard;

tableWildcard: (identifier DOT)? STAR;

tableExpression: tableReference (joinExpression)*;

tableReference:
	tableOrCteReference (AS? alias)?
	| LPAREN selectStatement RPAREN (AS? alias)?
	| LPAREN unionStatement RPAREN (AS? alias)?;

tableOrCteReference: tableName | identifier;

joinExpression: joinType? JOIN tableReference ON condition;

joinType: INNER | LEFT | RIGHT | FULL;

condition: expression;

groupByElements: expression (COMMA expression)*;

orderByElements: orderByElement (COMMA orderByElement)*;

orderByElement: expression (ASC | DESC)?;

limitClause: INTEGER_LITERAL;

expression:
	expression BETWEEN expression AND expression
	| expression IN LPAREN (expressionList | selectStatement) RPAREN
	| expression IS (NOT)? NULL
	| expression binaryOperator expression
	| expression CAST_OP dataType // PostgreSQL-style casting (e.g., 1::Int32)
	| expression DOT identifier // Dot notation
	| expression LBRACKET expression RBRACKET // Array/map indexing
	| functionCall
	| castExpression // Standard SQL CAST function
	| LPAREN expression RPAREN
	| CASE (expression)? whenClause+ (ELSE expression)? END
	| primaryExpression;

castExpression: CAST LPAREN expression AS dataType RPAREN;

dataType:
	identifier (LPAREN typeArguments RPAREN)?
	| ARRAY LPAREN dataType RPAREN // Array(Int32)
	| MAP LPAREN dataType COMMA dataType RPAREN // Map(String, String)
	| TUPLE LPAREN dataType (COMMA dataType)* RPAREN; // Tuple(Int32, String)

typeArguments: typeArgument (COMMA typeArgument)*;

typeArgument: dataType | INTEGER_LITERAL;

whenClause: WHEN expression THEN expression;

expressionList: expression (COMMA expression)*;

primaryExpression:
	columnReference
	| literal
	| arrayLiteral // Array literal [1, 2, 3]
	| mapLiteral // Map literal {'key': 'value'}
	| tupleLiteral // Tuple literal (1, 'a', true)
	| LPAREN selectStatement RPAREN; // Subquery as primary expression

columnReference: (tableOrCtePrefix DOT)? columnName;

tableOrCtePrefix: tableName | identifier;

functionCall: identifier LPAREN functionArgs? RPAREN;

lambda: lambdaParams ARROW expression;

lambdaParams:
	identifier
	| LPAREN (identifier (COMMA identifier)*)? RPAREN;

functionArgs:
	STAR
	| DISTINCT expressionList
	| lambda (COMMA expressionList)?
	| expressionList;

binaryOperator:
	EQ
	| NEQ
	| LT
	| LE
	| GT
	| GE
	| PLUS
	| MINUS
	| STAR
	| DIV
	| MOD
	| AND
	| OR
	| LIKE;

literal:
	STRING_LITERAL
	| INTEGER_LITERAL
	| DECIMAL_LITERAL
	| NULL
	| TRUE
	| FALSE;

arrayLiteral:
	LBRACKET (expression (COMMA expression)*)? RBRACKET;

mapLiteral:
	LBRACE (mapEntry (COMMA mapEntry)*)? RBRACE
	| MAP LPAREN (mapPair (COMMA mapPair)*)? RPAREN;

mapEntry: expression COLON expression;

mapPair: expression COMMA expression;

tupleLiteral:
	LPAREN expression (COMMA expression)+ RPAREN // Requires at least 2 elements
	| TUPLE LPAREN (expression (COMMA expression)*)? RPAREN;

tableName: identifier (DOT identifier)?;

columnName: identifier;

functionName: identifier;

alias: identifier;

identifier: IDENTIFIER | QUOTED_IDENTIFIER | keyword;

// All keywords that can potentially be used as identifiers
keyword:
	SELECT
	| FROM
	| WHERE
	| GROUP
	| BY
	| ORDER
	| LIMIT
	| AS
	| JOIN
	| ON
	| INNER
	| LEFT
	| RIGHT
	| FULL
	| AND
	| OR
	| NOT
	| IN
	| BETWEEN
	| LIKE
	| IS
	| NULL
	| TRUE
	| FALSE
	| CASE
	| WHEN
	| THEN
	| ELSE
	| END
	| DISTINCT
	| ASC
	| DESC
	| CAST
	| WITH
	| UNION
	| ALL
	| ARRAY
	| MAP
	| TUPLE
	| OFFSET
	| OUTER;

// Lexer rules - Keywords
SELECT: S E L E C T;
FROM: F R O M;
WHERE: W H E R E;
GROUP: G R O U P;
BY: B Y;
ORDER: O R D E R;
LIMIT: L I M I T;
AS: A S;
JOIN: J O I N;
ON: O N;
INNER: I N N E R;
LEFT: L E F T;
RIGHT: R I G H T;
FULL: F U L L;
AND: A N D;
OR: O R;
NOT: N O T;
IN: I N;
BETWEEN: B E T W E E N;
LIKE: L I K E;
IS: I S;
NULL: N U L L;
TRUE: T R U E;
FALSE: F A L S E;
CASE: C A S E;
WHEN: W H E N;
THEN: T H E N;
ELSE: E L S E;
END: E N D;
DISTINCT: D I S T I N C T;
ASC: A S C;
DESC: D E S C;
CAST: C A S T;
WITH: W I T H;
UNION: U N I O N;
ALL: A L L;
ARRAY: A R R A Y;
MAP: M A P;
TUPLE: T U P L E;
OFFSET: O F F S E T;
OUTER: O U T E R;

// Lexer rules - Comparison Operators
EQ: '=';
NEQ: '!=' | '<>';
LT: '<';
GT: '>';
LE: '<=';
GE: '>=';

// Lexer rules - Arithmetic Operators
PLUS: '+';
MINUS: '-';
STAR: '*';
DIV: '/';
MOD: '%';
ARROW: '->';

// Lexer rules - Delimiters
LPAREN: '(';
RPAREN: ')';
COMMA: ',';
SEMICOLON: ';';
DOT: '.';
LBRACKET: '[';
RBRACKET: ']';
LBRACE: '{';
RBRACE: '}';
COLON: ':';
CAST_OP: '::';

// Lexer rules - Literals
STRING_LITERAL: '\'' (~['])* '\'';

INTEGER_LITERAL: [0-9]+;

DECIMAL_LITERAL: [0-9]+ '.' [0-9]* | '.' [0-9]+;

IDENTIFIER: [a-zA-Z_] [a-zA-Z_0-9]*;

QUOTED_IDENTIFIER:
	'"' (~'"' | '""')* '"'
	| '`' (~'`' | '``')* '`';

// Whitespace and comments
WS: [ \t\r\n]+ -> skip;
COMMENT: '--' ~[\r\n]* -> skip;
MULTI_LINE_COMMENT: '/*' .*? '*/' -> skip;

// Case-insensitive matching fragments
fragment A: [aA];
fragment B: [bB];
fragment C: [cC];
fragment D: [dD];
fragment E: [eE];
fragment F: [fF];
fragment G: [gG];
fragment H: [hH];
fragment I: [iI];
fragment J: [jJ];
fragment K: [kK];
fragment L: [lL];
fragment M: [mM];
fragment N: [nN];
fragment O: [oO];
fragment P: [pP];
fragment Q: [qQ];
fragment R: [rR];
fragment S: [sS];
fragment T: [tT];
fragment U: [uU];
fragment V: [vV];
fragment W: [wW];
fragment X: [xX];
fragment Y: [yY];
fragment Z: [zZ];
```

NOTE: 
Convert Addresses to lowercase when querying, as all addresses in the SQL API are stored in lowercase.
