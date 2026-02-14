/*
 * Copyright 2026 Sebastian Jn <sebastianjnuwu@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
**/
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import $ from "jquery";

/**
 * Obtém a versão atual do aplicativo.
 *
 * - Em plataformas nativas (Android/iOS), busca a versão diretamente do App Info via Capacitor.
 * - Em ambiente web, retorna uma versão fixa como fallback.
 *
 * @returns {Promise<string>} Versão atual do aplicativo.
 */
const getCurrentVersion = async (): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    const { version } = await App.getInfo();
    return version;
  } 
  return "1.0.3";
};

/**
 * Verifica se existe uma versão mais recente do app disponível no repositório.
 *
 * - Compara a versão atual do app com a versão do `package.json` remoto.
 * - Caso sejam diferentes, exibe a tela de atualização.
 * - Define o link do botão de update para o repositório oficial.
 *
 * @async
 */
getCurrentVersion().then((CURRENT_VERSION) => {
  $.getJSON(
    "https://raw.githubusercontent.com/sebastianjnuwu/cookie-clicker-brasil/refs/heads/android/package.json",
    ({ version, repository }) => {
      if (version !== CURRENT_VERSION) {
        $("#update-screen").show();
        $(".update-btn").attr("href", repository.url);
      }
    }
  );
});
