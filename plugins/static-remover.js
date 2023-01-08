export default function (context, inject) {
  context.app.$staticRemover = function (string) {
    // if the string contains the string '/static' then remove it
    if (string.includes('/static')) {
      return string.replace('/static', '');
    } else {
      return string;
    }
  }

  inject('staticRemover', context.app.$staticRemover)
}