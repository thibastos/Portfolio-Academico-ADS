#include <ctype.h>
#include <errno.h>
#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Cada nó armazena um valor inteiro e o endereço do próximo nó.
 */
typedef struct No {
    int dado;
    struct No *proximo;
} No;

/**
 * Lê um número inteiro de forma segura.
 *
 * Retorna true quando a leitura é válida e false quando a entrada é encerrada.
 */
static bool ler_inteiro(const char *mensagem, int *valor) {
    char entrada[100];

    while (true) {
        printf("%s", mensagem);

        if (fgets(entrada, sizeof entrada, stdin) == NULL) {
            return false;
        }

        /* Descarta o restante de uma linha maior que o buffer. */
        if (strchr(entrada, '\n') == NULL) {
            int caractere;
            while ((caractere = getchar()) != '\n' && caractere != EOF) {
                /* Apenas descarta os caracteres restantes. */
            }
            printf("Entrada muito longa. Digite apenas um numero inteiro.\n");
            continue;
        }

        errno = 0;
        char *fim;
        long numero = strtol(entrada, &fim, 10);

        while (isspace((unsigned char)*fim)) {
            fim++;
        }

        if (fim == entrada || *fim != '\0' || errno == ERANGE ||
            numero < INT_MIN || numero > INT_MAX) {
            printf("Entrada invalida. Digite apenas um numero inteiro.\n");
            continue;
        }

        *valor = (int)numero;
        return true;
    }
}

/**
 * Insere um novo valor no início da lista.
 */
static bool incluir(No **lista, int valor) {
    No *novo = malloc(sizeof *novo);

    if (novo == NULL) {
        return false;
    }

    novo->dado = valor;
    novo->proximo = *lista;
    *lista = novo;

    return true;
}

/**
 * Exibe todos os elementos armazenados na lista.
 */
static void listar(const No *lista) {
    if (lista == NULL) {
        printf("Lista vazia.\n");
        return;
    }

    printf("INICIO -> ");

    for (const No *atual = lista; atual != NULL; atual = atual->proximo) {
        printf("%d -> ", atual->dado);
    }

    printf("NULL\n");
}

/**
 * Procura a primeira ocorrência de um valor na lista.
 */
static No *consultar(No *lista, int valor) {
    for (No *atual = lista; atual != NULL; atual = atual->proximo) {
        if (atual->dado == valor) {
            return atual;
        }
    }

    return NULL;
}

/**
 * Altera a primeira ocorrência de valor_antigo para valor_novo.
 */
static bool alterar(No *lista, int valor_antigo, int valor_novo) {
    No *no_encontrado = consultar(lista, valor_antigo);

    if (no_encontrado == NULL) {
        return false;
    }

    no_encontrado->dado = valor_novo;
    return true;
}

/**
 * Remove a primeira ocorrência do valor informado.
 */
static bool remover(No **lista, int valor) {
    No **ligacao_atual = lista;

    while (*ligacao_atual != NULL && (*ligacao_atual)->dado != valor) {
        ligacao_atual = &(*ligacao_atual)->proximo;
    }

    if (*ligacao_atual == NULL) {
        return false;
    }

    No *removido = *ligacao_atual;
    *ligacao_atual = removido->proximo;
    free(removido);

    return true;
}

/**
 * Libera todos os nós alocados dinamicamente.
 */
static void liberar_lista(No **lista) {
    while (*lista != NULL) {
        No *removido = *lista;
        *lista = removido->proximo;
        free(removido);
    }
}

static void exibir_menu(void) {
    printf("\n--- Gerenciador de Lista Simplesmente Encadeada ---\n");
    printf("1. Incluir elemento no inicio\n");
    printf("2. Listar elementos\n");
    printf("3. Consultar elemento\n");
    printf("4. Alterar elemento\n");
    printf("5. Remover elemento\n");
    printf("0. Sair\n");
}

int main(void) {
    No *lista = NULL;
    bool executando = true;
    int codigo_saida = EXIT_SUCCESS;

    while (executando) {
        int opcao;

        exibir_menu();

        if (!ler_inteiro("Escolha uma opcao: ", &opcao)) {
            printf("\nEntrada encerrada. Finalizando o programa.\n");
            break;
        }

        switch (opcao) {
            case 1: {
                int valor;

                if (!ler_inteiro("Digite o valor a ser incluido: ", &valor)) {
                    executando = false;
                    break;
                }

                if (!incluir(&lista, valor)) {
                    fprintf(stderr, "Erro: nao foi possivel alocar memoria.\n");
                    codigo_saida = EXIT_FAILURE;
                    executando = false;
                    break;
                }

                printf("Valor %d incluido com sucesso.\n", valor);
                break;
            }

            case 2:
                listar(lista);
                break;

            case 3: {
                int valor;

                if (!ler_inteiro("Digite o valor a ser consultado: ", &valor)) {
                    executando = false;
                    break;
                }

                if (consultar(lista, valor) != NULL) {
                    printf("Valor %d encontrado na lista.\n", valor);
                } else {
                    printf("Valor %d nao encontrado na lista.\n", valor);
                }
                break;
            }

            case 4: {
                int valor_antigo;
                int valor_novo;

                if (!ler_inteiro("Digite o valor a ser alterado: ", &valor_antigo) ||
                    !ler_inteiro("Digite o novo valor: ", &valor_novo)) {
                    executando = false;
                    break;
                }

                if (alterar(lista, valor_antigo, valor_novo)) {
                    printf("Valor %d alterado para %d com sucesso.\n",
                           valor_antigo, valor_novo);
                } else {
                    printf("Valor %d nao encontrado na lista.\n", valor_antigo);
                }
                break;
            }

            case 5: {
                int valor;

                if (!ler_inteiro("Digite o valor a ser removido: ", &valor)) {
                    executando = false;
                    break;
                }

                if (remover(&lista, valor)) {
                    printf("Valor %d removido com sucesso.\n", valor);
                } else {
                    printf("Valor %d nao encontrado na lista.\n", valor);
                }
                break;
            }

            case 0:
                executando = false;
                break;

            default:
                printf("Opcao invalida. Escolha um numero entre 0 e 5.\n");
        }
    }

    liberar_lista(&lista);
    printf("Programa encerrado. Memoria liberada.\n");

    return codigo_saida;
}
