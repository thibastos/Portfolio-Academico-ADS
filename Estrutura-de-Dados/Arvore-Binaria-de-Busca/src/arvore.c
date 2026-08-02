#include <ctype.h>
#include <errno.h>
#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int valor;
    struct No *esquerda;
    struct No *direita;
} No;

typedef enum ResultadoInsercao {
    INSERCAO_SUCESSO,
    INSERCAO_DUPLICADA,
    INSERCAO_SEM_MEMORIA
} ResultadoInsercao;

static bool ler_inteiro(const char *mensagem, int *valor);
static ResultadoInsercao inserir_no(No **raiz, int valor);
static bool remover_no(No **raiz, int valor);
static void percorrer_pre_ordem(const No *raiz);
static void percorrer_em_ordem(const No *raiz);
static void percorrer_pos_ordem(const No *raiz);
static void liberar_arvore(No **raiz);
static void exibir_menu(void);
static void exibir_percurso(const char *titulo,
                            const No *raiz,
                            void (*percorrer)(const No *));

int main(void) {
    No *raiz = NULL;
    bool executando = true;

    while (executando) {
        int opcao;

        exibir_menu();
        if (!ler_inteiro("Escolha: ", &opcao)) {
            printf("\nEntrada encerrada. Finalizando o programa...\n");
            break;
        }

        switch (opcao) {
            case 1: {
                int valor;

                if (!ler_inteiro("Digite o valor para incluir: ", &valor)) {
                    executando = false;
                    break;
                }

                ResultadoInsercao resultado = inserir_no(&raiz, valor);

                if (resultado == INSERCAO_SUCESSO) {
                    printf("Valor %d incluido com sucesso.\n", valor);
                } else if (resultado == INSERCAO_DUPLICADA) {
                    printf("O valor %d ja existe na arvore.\n", valor);
                } else {
                    fprintf(stderr,
                            "Erro: nao foi possivel alocar memoria para o novo no.\n");
                    executando = false;
                }
                break;
            }

            case 2: {
                int valor;

                if (!ler_inteiro("Digite o valor para remover: ", &valor)) {
                    executando = false;
                    break;
                }

                if (remover_no(&raiz, valor)) {
                    printf("Valor %d removido com sucesso.\n", valor);
                } else {
                    printf("Valor %d nao encontrado na arvore.\n", valor);
                }
                break;
            }

            case 3:
                exibir_percurso("Percurso em pre-ordem", raiz,
                                percorrer_pre_ordem);
                break;

            case 4:
                exibir_percurso("Percurso em ordem", raiz,
                                percorrer_em_ordem);
                break;

            case 5:
                exibir_percurso("Percurso em pos-ordem", raiz,
                                percorrer_pos_ordem);
                break;

            case 0:
                executando = false;
                break;

            default:
                printf("Opcao invalida. Escolha um numero entre 0 e 5.\n");
                break;
        }
    }

    liberar_arvore(&raiz);
    printf("Programa encerrado. Memoria liberada.\n");

    return EXIT_SUCCESS;
}

static bool ler_inteiro(const char *mensagem, int *valor) {
    char entrada[128];

    while (true) {
        char *fim;
        long numero;

        printf("%s", mensagem);

        if (fgets(entrada, sizeof entrada, stdin) == NULL) {
            return false;
        }

        errno = 0;
        numero = strtol(entrada, &fim, 10);

        if (entrada == fim) {
            printf("Entrada invalida. Digite um numero inteiro.\n");
            continue;
        }

        while (isspace((unsigned char)*fim)) {
            fim++;
        }

        if (*fim != '\0') {
            printf("Entrada invalida. Digite apenas um numero inteiro.\n");
            continue;
        }

        if (errno == ERANGE || numero < INT_MIN || numero > INT_MAX) {
            printf("Numero fora do intervalo permitido para o tipo int.\n");
            continue;
        }

        *valor = (int)numero;
        return true;
    }
}

static ResultadoInsercao inserir_no(No **raiz, int valor) {
    No **ligacao_atual = raiz;

    while (*ligacao_atual != NULL) {
        if (valor < (*ligacao_atual)->valor) {
            ligacao_atual = &(*ligacao_atual)->esquerda;
        } else if (valor > (*ligacao_atual)->valor) {
            ligacao_atual = &(*ligacao_atual)->direita;
        } else {
            return INSERCAO_DUPLICADA;
        }
    }

    No *novo = malloc(sizeof *novo);
    if (novo == NULL) {
        return INSERCAO_SEM_MEMORIA;
    }

    novo->valor = valor;
    novo->esquerda = NULL;
    novo->direita = NULL;
    *ligacao_atual = novo;

    return INSERCAO_SUCESSO;
}

static bool remover_no(No **raiz, int valor) {
    No **ligacao_atual = raiz;

    while (*ligacao_atual != NULL && (*ligacao_atual)->valor != valor) {
        if (valor < (*ligacao_atual)->valor) {
            ligacao_atual = &(*ligacao_atual)->esquerda;
        } else {
            ligacao_atual = &(*ligacao_atual)->direita;
        }
    }

    if (*ligacao_atual == NULL) {
        return false;
    }

    No *alvo = *ligacao_atual;

    if (alvo->esquerda == NULL) {
        *ligacao_atual = alvo->direita;
        free(alvo);
    } else if (alvo->direita == NULL) {
        *ligacao_atual = alvo->esquerda;
        free(alvo);
    } else {
        No **ligacao_sucessor = &alvo->direita;

        while ((*ligacao_sucessor)->esquerda != NULL) {
            ligacao_sucessor = &(*ligacao_sucessor)->esquerda;
        }

        No *sucessor = *ligacao_sucessor;
        alvo->valor = sucessor->valor;
        *ligacao_sucessor = sucessor->direita;
        free(sucessor);
    }

    return true;
}

static void percorrer_pre_ordem(const No *raiz) {
    if (raiz == NULL) {
        return;
    }

    printf("%d ", raiz->valor);
    percorrer_pre_ordem(raiz->esquerda);
    percorrer_pre_ordem(raiz->direita);
}

static void percorrer_em_ordem(const No *raiz) {
    if (raiz == NULL) {
        return;
    }

    percorrer_em_ordem(raiz->esquerda);
    printf("%d ", raiz->valor);
    percorrer_em_ordem(raiz->direita);
}

static void percorrer_pos_ordem(const No *raiz) {
    if (raiz == NULL) {
        return;
    }

    percorrer_pos_ordem(raiz->esquerda);
    percorrer_pos_ordem(raiz->direita);
    printf("%d ", raiz->valor);
}

static void liberar_arvore(No **raiz) {
    if (raiz == NULL || *raiz == NULL) {
        return;
    }

    liberar_arvore(&(*raiz)->esquerda);
    liberar_arvore(&(*raiz)->direita);
    free(*raiz);
    *raiz = NULL;
}

static void exibir_menu(void) {
    printf("\n* * * MENU DE OPCOES * * *\n");
    printf("1. Incluir no\n");
    printf("2. Remover no\n");
    printf("3. Percorrer em pre-ordem\n");
    printf("4. Percorrer em ordem\n");
    printf("5. Percorrer em pos-ordem\n");
    printf("0. Encerrar\n");
}

static void exibir_percurso(const char *titulo,
                            const No *raiz,
                            void (*percorrer)(const No *)) {
    printf("\n--- %s ---\n", titulo);

    if (raiz == NULL) {
        printf("Arvore vazia.\n");
        return;
    }

    percorrer(raiz);
    printf("\n");
}
